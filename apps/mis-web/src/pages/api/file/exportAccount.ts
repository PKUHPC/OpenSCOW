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
import { OperationResult } from "@scow/lib-operation-log";
import { getCurrentLanguageId } from "@scow/lib-web/build/utils/systemLanguage";
import { Account } from "@scow/protos/build/server/account";
import { ExportServiceClient } from "@scow/protos/build/server/export";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getT, prefix } from "src/i18n";
import { OperationType } from "src/models/operationLog";
import { PlatformRole, TenantRole } from "src/models/User";
import { MAX_EXPORT_COUNT } from "src/pageComponents/file/apis";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { getCsvObjTransform, getCsvStringify } from "src/utils/file";
import { nullableMoneyToString } from "src/utils/money";
import { route } from "src/utils/route";
import { getContentType, parseIp } from "src/utils/server";
import { pipeline } from "stream";

export const ExportAccountSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    columns: Type.Array(Type.String()),
    count: Type.Number(),
    accountName: Type.Optional(Type.String()),
    tenantName: Type.Optional(Type.String()),
    blocked: Type.Optional(Type.Boolean()),
    debt: Type.Optional(Type.Boolean()),
    // 是否来自平台管理页面
    isFromAdmin: Type.Boolean(),
  }),

  responses:{
    200: Type.Any(),

    409: Type.Object({ code: Type.Literal("TOO_MANY_DATA") }),
  },
});

const tenantAuth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN)
|| info.tenantRoles.includes(TenantRole.TENANT_FINANCE));


const adminAuth = authenticate((info) =>
  info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
  info.platformRoles.includes(PlatformRole.PLATFORM_FINANCE));

export default route(ExportAccountSchema, async (req, res) => {
  const { query } = req;

  const { columns, accountName, tenantName, blocked, debt, count, isFromAdmin } = query;


  const info = isFromAdmin ? await adminAuth(req, res) : await tenantAuth(req, res);

  if (!info) {
    return;
  }

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.exportAccount,
    operationTypePayload:{
      tenantName: isFromAdmin ? tenantName : info.tenant,
    },
  };

  if (count > MAX_EXPORT_COUNT) {
    await callLog(logInfo, OperationResult.FAIL);
    return { 409: { code: "TOO_MANY_DATA" } } as const;

  } else {
    const client = getClient(ExportServiceClient);

    const filename = `account-${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}.csv`;
    const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

    res.writeHead(200, {
      "Content-Type": getContentType(filename, "application/octet-stream"),
      "Content-Disposition": `attachment; ${dispositionParm}`,
    });

    const stream = asyncReplyStreamCall(client, "exportAccount", {
      count,
      accountName,
      tenantName: isFromAdmin ? tenantName : info.tenant,
      blocked,
      debt,
    });

    const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);
    const t = await getT(languageId);
    const p = prefix("pageComp.accounts.accountTable.");
    const pCommon = prefix("common.");

    const headerColumns = {
      accountName: t(p("accountName")),
      owner: t(p("owner")),
      userCount:  t(pCommon("userCount")),
      tenantName: t(p("tenant")),
      balance: t(pCommon("balance")),
      blocked: t(p("status")),
      comment: t(p("comment")),
    };

    const formatAccount = (x: Account) => {
      return {
        accountName: x.accountName,
        owner: `${x.ownerName}(ID:${x.ownerId})`,
        userCount: x.userCount,
        tenantName: x.tenantName,
        balance: nullableMoneyToString(x.balance) + t(p("unit")),
        blocked: `${x.blocked ? t(p("block")) : t(p("normal"))}`,
        comment: x.comment,
      };
    };

    const csvStringify = getCsvStringify(headerColumns, columns);

    const transform = getCsvObjTransform("accounts", formatAccount);
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
