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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ClusterRuntimeInfo, ConfigServiceClient } from "@scow/protos/build/server/config";
import { getClientFn } from "src/utils/api";

export const libGetClustersRuntimeInfo = async (
  misServerUrl?: string,
  scowApiAuthToken?: string,
): Promise<ClusterRuntimeInfo[]> => {

  // if mis is Deployed
  if (!misServerUrl) {
    return [];
  }

  const config = {
    SERVER_URL: misServerUrl,
    SCOW_API_AUTH_TOKEN: scowApiAuthToken,
  };
  const getMisClient = getClientFn(config);
  const client = getMisClient(ConfigServiceClient);
  try {
    const reply = await asyncClientCall(client, "getClustersRuntimeInfo", {});
    return reply.results;
  } catch (e: any) {
    console.error(e.details);
    return [];
  }
};

