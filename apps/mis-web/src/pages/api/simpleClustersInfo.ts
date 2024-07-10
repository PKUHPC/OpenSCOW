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
import { ClusterConfigSchema, SimpleClusterSchema } from "@scow/config/build/cluster";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClusterConfigFiles } from "src/server/clusterConfig";
import { queryIfInitialized } from "src/utils/init";
import { route } from "src/utils/route";

export const GetSimpleClustersInfoFromConfigFilesSchema = typeboxRouteSchema({
  method: "GET",

  responses: {

    200: Type.Object({
      clustersInfo:  Type.Record(Type.String(), SimpleClusterSchema) }),

    403: Type.Null(),
  },
});

const auth = authenticate(() => true);
export default route(GetSimpleClustersInfoFromConfigFilesSchema,
  async (req, res) => {

    // if not initialized, every one can getSimpleClusterInfo which includes clusterId, displayedName and priority
    if (await queryIfInitialized()) {
      const info = await auth(req, res);
      if (!info) { return { 403: null }; }
    }

    const clustersFullInfo: Record<string, ClusterConfigSchema> = await getClusterConfigFiles();

    const clustersInfo: Record<string, SimpleClusterSchema> = {};

    Object.keys(clustersFullInfo).forEach((key) => {
      clustersInfo[key] = {
        clusterId: key,
        displayName: clustersFullInfo[key].displayName,
        priority: clustersFullInfo[key].priority,
      };
    });

    return {
      200: { clustersInfo },
    };
  });
