/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncReplyStreamCall } from "@ddadaal/tsgrpc-client";
import { formatDateTime } from "@scow/lib-web/build/utils/datetime";
import { PaymentRecord } from "@scow/protos/build/server/charging";
import { FileServiceClient } from "@scow/protos/build/server/file";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { SearchType } from "src/pageComponents/common/PaymentTable";
import { MAX_EXPORT_COUNT } from "src/pageComponents/file/apis";
import { getClient } from "src/utils/client";
import { getCsvObjTransform, getCsvStringify } from "src/utils/file";
import { nullableMoneyToString } from "src/utils/money";
import { route } from "src/utils/route";
import { getContentType } from "src/utils/server";
import { pipeline } from "stream";

import { getPaymentRecordTarget } from "../finance/payments";

export const ExportPayRecordSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    columns: Type.Array(Type.String()),
    count: Type.Number(),
    startTime: Type.String({ format: "date-time" }),
    endTime: Type.String({ format: "date-time" }),
    targetName: Type.Optional(Type.String()),
    searchType: Type.Enum(SearchType),
  }),

  responses:{
    200: Type.Any(),

    409: Type.Object({ code: Type.Literal("TOO_MANY_DATA") }),
  },
});

export default route(ExportPayRecordSchema, async (req, res) => {

  const { query } = req;

  const { columns, startTime, endTime, targetName, searchType, count } = query;

  let user;
  if (searchType === SearchType.tenant) {
    user = await authenticate((i) => i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
    i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(req, res);
  } else {
    if (targetName) {
      user = await authenticate((i) =>
        i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
          i.tenantRoles.includes(TenantRole.TENANT_ADMIN) ||
          i.accountAffiliations.some((x) => x.accountName === targetName && x.role !== UserRole.USER),
      )(req, res);
    } else {
      user = await authenticate((i) =>
        i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
          i.tenantRoles.includes(TenantRole.TENANT_ADMIN),
      )(req, res);
    }
  }

  if (!user) { return; }

  if (count > MAX_EXPORT_COUNT) {
    // await callLog(logInfo, OperationResult.FAIL);
    return { 409: { code: "TOO_MANY_DATA" } } as const;

  } else {

    const client = getClient(FileServiceClient);

    const filename = `pay_record-${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}.csv`;
    const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

    res.writeHead(200, {
      "Content-Type": getContentType(filename, "application/octet-stream"),
      "Content-Disposition": `attachment; ${dispositionParm}`,
    });

    const stream = asyncReplyStreamCall(client, "export", {
      count,
      exportEvent: {
        $case: "payRecord",
        payRecord: {
          startTime,
          endTime,
          target: getPaymentRecordTarget(searchType, user, targetName),
        },
      },
    });

    const formatPayRecord = (x: PaymentRecord) => {
      return {
        id: x.index,
        accountName: x.accountName,
        tenantName: x.tenantName,
        time: formatDateTime(x.time ?? ""),
        amount: nullableMoneyToString(x.amount),
        type: x.type,
        ipAddress: x.ipAddress,
        operatorId: x.operatorId,
        comment: x.comment,
      };
    };

    const headerColumns = {
      id: "ID",
      accountName: "Account Name",
      tenantName: "Tenant Name",
      time: "Time",
      amount: "Amount",
      type: "Type",
      ipAddress:  "IP Address",
      operatorId: "Operator ID",
      comment: "Comment",
    };
    const csvStringify = getCsvStringify(headerColumns, columns);

    const transform = getCsvObjTransform(formatPayRecord);

    pipeline(
      stream,
      transform,
      csvStringify,
      res,
      (err) => {
        if (err) {
          console.error("Pipeline failed", err);
        }
      },
    );
  }
});
