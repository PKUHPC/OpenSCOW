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
import { getI18nConfigCurrentText, getServerCurrentLanguageId } from "@scow/lib-web/build/utils/systemLanguage";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
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

  const languageId = getServerCurrentLanguageId(req, publicConfig.SYSTEM_LANGUAGE_CONFIG);

  const info = await auth(req, res);

  if (!info) { return; }

  const clusterList: ClusterInfo[] = publicConfig.CLUSTERS
    .filter((x) => runtimeConfig.CLUSTERS_CONFIG[x.id].crossClusterFileTransfer?.enabled)
    .map((x) => ({
      id: x.id,
      name: getI18nConfigCurrentText(x.name, languageId),
    }));


  return { 200: { clusterList: clusterList } };

});
