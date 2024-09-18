/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { libGetClustersRuntimeInfo } from "@scow/lib-web/build/server/clustersActivation";
import { getCurrentLanguageId, getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { ClusterActivationStatus } from "@scow/protos/build/server/config";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClusterConfigFiles } from "src/server/clusterConfig";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export const Cluster = Type.Object({
  id: Type.String(),
  name: Type.String(),
});

export type ClusterInfo = Static<typeof Cluster>;

export const ListAvailableTransferClustersSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({}),

  responses: {
    200: Type.Object({
      clusterList: Type.Array(Cluster),
    }),

    403: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default route(ListAvailableTransferClustersSchema, async (req, res) => {

  const languageId = getCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);

  const info = await auth(req, res);

  if (!info) { return; }

  const clusterConfigs = await getClusterConfigFiles();

  const clustersRuntimeInfo = await libGetClustersRuntimeInfo(
    publicConfig.MIS_SERVER_URL, runtimeConfig.SCOW_API_AUTH_TOKEN);

  const clusterList: ClusterInfo[] = clustersRuntimeInfo
    .filter((x) => x.activationStatus === ClusterActivationStatus.ACTIVATED
      && clusterConfigs[x.clusterId]?.crossClusterFileTransfer?.enabled)
    .map((x) => ({
      id: x.clusterId,
      name: getI18nConfigCurrentText(clusterConfigs[x.clusterId].displayName, languageId),
    }));


  return { 200: { clusterList: clusterList } };

});
