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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, SortDirectionType, UsersSortFieldType } from "src/models/User";
import { PlatformUserInfo } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

import { mapSortDirectionType, mapUsersSortFieldType } from "./getAllUsers";

export const GetPlatformRoleUsersResponse = Type.Object({
  totalCount: Type.Number(),
  totalAdminCount: Type.Number(),
  totalFinanceCount: Type.Number(),
  queryAdminCount: Type.Number(),
  platformAdminUsers: Type.Array(PlatformUserInfo),
  queryFinanceCount: Type.Number(),
  platformFinanceUsers: Type.Array(PlatformUserInfo),
});
export type GetPlatformRoleUsersResponse = Static<typeof GetPlatformRoleUsersResponse>;

export const GetPlatformRoleUsersSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    /**
     * @minimum 1
     * @type integer
     */
    page: Type.Optional(Type.Integer({ minimum: 1 })),

    /**
     * @type integer
     */
    pageSize: Type.Optional(Type.Integer()),

    sortField: Type.Optional(UsersSortFieldType),

    sortOrder: Type.Optional(SortDirectionType),

    idOrName: Type.Optional(Type.String()),

  }),

  responses: {
    200: GetPlatformRoleUsersResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetPlatformRoleUsersSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { page = 1, pageSize, sortField, sortOrder, idOrName } = req.query;

    const client = getClient(UserServiceClient);

    const mappedSortField = sortField ? mapUsersSortFieldType[sortField] : undefined;
    const mappedSortOrder = sortOrder ? mapSortDirectionType[sortOrder] : undefined;

    const result = await asyncClientCall(client, "getPlatformRoleUsers", {
      page,
      pageSize,
      sortField: mappedSortField,
      sortOrder: mappedSortOrder,
      idOrName,
    });

    return {
      200: result,
    };
  });
