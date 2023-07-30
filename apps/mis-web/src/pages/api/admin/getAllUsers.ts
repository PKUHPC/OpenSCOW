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
import { SortDirection, UserServiceClient, UsersSortField } from "@scow/protos/build/server/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { PlatformRole, SortDirectionType, UsersSortFieldType } from "src/models/User";
import { PlatformUserInfo } from "src/models/UserSchemaModel";
import { getClient } from "src/utils/client";

// Cannot use GetAllUsersResponse from protos
export const GetAllUsersResponse = Type.Object({
  totalCount: Type.Number(),
  platformUsers: Type.Array(PlatformUserInfo),
});
export type GetAllUsersResponse = Static<typeof GetAllUsersResponse>;

export const mapSortDirectionType = {
  "ascend": SortDirection.ASC,
  "descend": SortDirection.DESC,
} as { [key: string]: SortDirection };

export const mapUsersSortFieldType = {
  "userId": UsersSortField.USER_ID,
  "name": UsersSortField.NAME,
  "createTime": UsersSortField.CREATE_TIME,
} as { [key: string]: UsersSortField };


export const GetAllUsersSchema = typeboxRouteSchema({
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

    platformRole: Type.Optional(Type.Enum(PlatformRole)),

  }),

  responses: {
    200: GetAllUsersResponse,
  },
});

const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

export default typeboxRoute(GetAllUsersSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { page = 1, pageSize, sortField, sortOrder, idOrName, platformRole } = req.query;

    const client = getClient(UserServiceClient);

    const mappedSortField = sortField ? mapUsersSortFieldType[sortField] : undefined;
    const mappedSortOrder = sortOrder ? mapSortDirectionType[sortOrder] : undefined;

    const result = await asyncClientCall(client, "getAllUsers", {
      page,
      pageSize,
      sortField: mappedSortField,
      sortOrder: mappedSortOrder,
      idOrName,
      platformRole,
    });

    return {
      200: result,
    };
  });
