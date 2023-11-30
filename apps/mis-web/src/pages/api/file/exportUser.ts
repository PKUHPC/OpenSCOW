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
import { FileServiceClient } from "@scow/protos/build/server/file";
import { PlatformUserInfo } from "@scow/protos/build/server/user";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult, OperationType } from "src/models/operationLog";
import {
  PlatformRole,
  PlatformRoleTexts,
  SortDirectionType,
  TenantRole,
  TenantRoleTexts,
  UsersSortFieldType } from "src/models/User";
import { MAX_EXPORT_COUNT } from "src/pageComponents/file/apis";
import { mapSortDirectionType, mapUsersSortFieldType } from "src/pages/api/admin/getAllUsers";
import { callLog } from "src/server/operationLog";
import { getClient } from "src/utils/client";
import { getCsvObjTransform, getCsvStringify } from "src/utils/file";
import { route } from "src/utils/route";
import { getContentType, parseIp } from "src/utils/server";
import { pipeline } from "stream";

export const ExportUserSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({

    columns: Type.Array(Type.String()),

    count: Type.Number(),

    sortField: Type.Optional(UsersSortFieldType),

    sortOrder: Type.Optional(SortDirectionType),

    idOrName: Type.Optional(Type.String()),

    platformRole: Type.Optional(Type.Enum(PlatformRole)),

    tenantRole: Type.Optional(Type.Enum(TenantRole)),

    // true表示只导出自己租户的用户
    selfTenant: Type.Optional(Type.Boolean()),
  }),

  responses:{
    200: Type.Any(),

    409: Type.Object({ code: Type.Literal("TOO_MANY_DATA") }),
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default route(ExportUserSchema, async (req, res) => {
  const { query } = req;

  const { columns, sortField, sortOrder, idOrName, platformRole, tenantRole, selfTenant, count } = query;

  const info = await auth(req, res);
  if (!info) {
    return;
  }

  const mappedSortField = sortField ? mapUsersSortFieldType[sortField] : undefined;
  const mappedSortOrder = sortOrder ? mapSortDirectionType[sortOrder] : undefined;

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.exportAccount,
    operationTypePayload:{
      tenantName: selfTenant ? info.tenant : undefined,
    },
  };

  if (count > MAX_EXPORT_COUNT) {
    await callLog(logInfo, OperationResult.FAIL);
    return { 409: { code: "TOO_MANY_DATA" } } as const;

  } else {
    const client = getClient(FileServiceClient);

    const filename = `account-${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}.csv`;
    const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);

    res.writeHead(200, {
      "Content-Type": getContentType(filename, "application/octet-stream"),
      "Content-Disposition": `attachment; ${dispositionParm}`,
    });

    const stream = asyncReplyStreamCall(client, "export", {
      count,
      exportEvent: {
        $case: "user",
        user: {
          sortField: mappedSortField,
          sortOrder: mappedSortOrder,
          idOrName,
          tenantName: selfTenant ? info.tenant : undefined,
          tenantRole,
          platformRole,
        },
      },
    });

    const headerColumns = {
      userId: "User ID",
      name: "Name",
      email: "Email",
      tenantName:  "Tenant",
      availableAccounts: "Available Accounts",
      createTime: "Create Time",
      tenantRoles: "Tenant Roles",
      platformRoles: "Platform Roles",
    };

    const formatUser = (x: PlatformUserInfo & {tenantRoles: TenantRole[]}) => {
      return {
        userId: x.userId,
        name: x.name,
        email: x.email,
        tenantName: x.tenantName,
        availableAccounts: x.availableAccounts.join(","),
        createTime: formatDateTime(x.createTime ?? ""),
        tenantRoles: x.tenantRoles.map((x) => TenantRoleTexts[x]).join(","),
        platformRoles: x.platformRoles.map((x) => PlatformRoleTexts[x]).join(","),
      };
    };

    const csvStringify = getCsvStringify(headerColumns, columns);

    const transform = getCsvObjTransform(formatUser);

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
