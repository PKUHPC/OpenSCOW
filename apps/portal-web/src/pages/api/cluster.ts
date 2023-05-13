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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { ConfigServiceClient, Partition } from "@scow/protos/build/common/config";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export interface PublicClusterConfig {
  submitJobDirTemplate: string;
  scheduler: {
    name: string;
    partitions: Partition[];
  }
}

export interface GetClusterInfoSchema {

  method: "GET";

  query: {
    cluster: string;
  }

  responses: {
    200: {
      clusterInfo: PublicClusterConfig;
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<GetClusterInfoSchema>("GetClusterInfoSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(ConfigServiceClient);

  const reply = await asyncUnaryCall(client, "getClusterConfig", {
    cluster,
  });

  return { 200: { clusterInfo: {
    submitJobDirTemplate: runtimeConfig.SUBMIT_JOB_WORKING_DIR,
    scheduler: {
      name: reply.schedulerName,
      partitions: reply.partitions,
    },
  } } };

});
