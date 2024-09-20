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
import { getUserAccountsClusterPartitions } from "@scow/lib-scow-resource/build/utils";
import { libWebGetUserInfo } from "@scow/lib-web/build/server/userAccount";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export const GetUserAssociatedClusterPartitionsSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: Type.Object({
      clusterPartitions: Type.Record(
        Type.String(),
        Type.Array(Type.String()),
      ),
    }),
    403: Type.Null(),

    204: Type.Null(),
  },
});

const auth = authenticate(() => true);
export default route(GetUserAssociatedClusterPartitionsSchema,
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) { return; }

    const reply = await libWebGetUserInfo(
      info.identityId, publicConfig.MIS_SERVER_URL, runtimeConfig.SCOW_API_AUTH_TOKEN);
    const accountNames = reply?.affiliations.map((a) => (a.accountName));
    const tenantName = reply?.tenantName;

    if (publicConfig.MIS_DEPLOYED && runtimeConfig.SCOW_RESOURCE_CONFIG?.enabled) {
      const resp = await getUserAccountsClusterPartitions(
        runtimeConfig.SCOW_RESOURCE_CONFIG,
        accountNames,
        tenantName,
      );

      if (!resp) { 
        return { 403: null };
      } else {
        return {
          200: {
            clusterPartitions: resp,
          },
        };
      }

    } else {
      return {
        204: null,
      };
    }
  });
