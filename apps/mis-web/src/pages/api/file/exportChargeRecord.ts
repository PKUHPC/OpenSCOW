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
import { getCurrentLanguageId } from "@scow/lib-web/build/utils/systemLanguage";
import { ChargeRecord } from "@scow/protos/build/server/charging";
import { ExportChargeRecordResponse, ExportServiceClient } from "@scow/protos/build/server/export";
import { Type } from "@sinclair/typebox";
import { getT, prefix } from "src/i18n";
import { OperationResult, OperationType } from "src/models/operationLog";
import { SearchType } from "src/models/User";
import { MAX_EXPORT_COUNT } from "src/pageComponents/file/apis";
import { buildChargesRequestTarget, getUserInfoForCharges } from "src/pages/api/finance/charges";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { getCsvObjTransform, getCsvStringify } from "src/utils/file";
import { nullableMoneyToString } from "src/utils/money";
import { route } from "src/utils/route";
import { getContentType, parseIp } from "src/utils/server";
import { pipeline } from "stream";

export const ExportChargeRecordSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    columns: Type.Array(Type.String()),
    count: Type.Number(),
    startTime: Type.String({ format: "date-time" }),
    endTime: Type.String({ format: "date-time" }),
    type: Type.Optional(Type.String()),
    accountName: Type.Optional(Type.String()),
    isPlatformRecords: Type.Optional(Type.Boolean()),
    searchType: Type.Optional(Type.Enum(SearchType)),
  }),

  responses:{
    200: Type.Any(),

    409: Type.Object({ code: Type.Literal("TOO_MANY_DATA") }),
  },
});



export default route(ExportChargeRecordSchema, async (req, res) => {
  const { query } = req;

  const { columns, startTime, endTime, accountName, type, searchType, isPlatformRecords, count } = query;

  const info = await getUserInfoForCharges(accountName, req, res);

  if (!info) { return; }


  const target = buildChargesRequestTarget(accountName, info, searchType, isPlatformRecords);

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.exportChargeRecord,
    operationTypePayload:{
      target,
    },
  };

  if (count > MAX_EXPORT_COUNT) {
    await callLog(logInfo, OperationResult.FAIL);
    return { 409: { code: "TOO_MANY_DATA" } } as const;

  } else {

    const client = getClient(ExportServiceClient);

    const filename = `charge_record-${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}.csv`;
    const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

    res.writeHead(200, {
      "Content-Type": getContentType(filename, "application/octet-stream"),
      "Content-Disposition": `attachment; ${dispositionParm}`,
    });

    const stream = asyncReplyStreamCall(client, "exportChargeRecord", {
      count,
      startTime,
      endTime,
      type,
      target,
    });

    const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);
    const t = await getT(languageId);
    const p = prefix("pageComp.finance.chargeTable.");
    const pCommon = prefix("common.");


    const formatChargeRecord = (x: ChargeRecord) => {
      return {
        id: x.index,
        accountName: x.accountName,
        tenantName: x.tenantName,
        time: formatDateTime(x.time ?? ""),
        amount: nullableMoneyToString(x.amount),
        type: x.type,
        comment: x.comment,
      };
    };

    const headerColumns = {
      id: "ID",
      accountName: t(pCommon("account")),
      tenantName: t(pCommon("tenant")),
      time: t(p("time")),
      amount: t(p("amount")),
      type: t(pCommon("type")),
      comment: t(pCommon("comment")),
    };

    const csvStringify = getCsvStringify(headerColumns, columns);

    const transform = getCsvObjTransform("chargeRecords", formatChargeRecord);

    let ccount = 0;
    stream.on("data", (data: ExportChargeRecordResponse) => {
      ccount += 1;
      console.log("length: ", data.chargeRecords.length);
      console.log("count: ", ccount);
      if (data.chargeRecords.length === 0) {
        console.log(data.chargeRecords);
      }
    });

    pipeline(
      stream,
      transform,
      csvStringify,
      res,
      async (err) => {
        if (err) {
          console.error("Pipeline failed", err);
          await callLog(logInfo, OperationResult.FAIL);
        } else {
          await callLog(logInfo, OperationResult.SUCCESS);
        }
      },
    );
  }
});
