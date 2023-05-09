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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { getSchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export interface Partition {
  name: string;
  mem: number;
  cores: number;
  gpus: number;
  nodes: number;
  qos?: string[];
  comment?: string;
}


export interface PublicClusterConfig {
  submitJobDirTemplate: string;
  slurm: { partitions: Partition[] }
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

  const client = getSchedulerAdapterClient(runtimeConfig.CLUSTERS_CONFIG[cluster].adapterUrl);

  const reply = await asyncClientCall(client.config, "getClusterConfig", {});

  const partitions = reply.partitions.map((x) => {
    return {
      name: x.name,
      mem: x.memMb,
      cores: x.cores,
      gpus: x.gpus,
      nodes: x.nodes,
      qos: x.qos,
      comment: x.comment,
    } as Partition;
  });


  return { 200: { clusterInfo: {
    submitJobDirTemplate: runtimeConfig.SUBMIT_JOB_WORKING_DIR,
    slurm: { partitions: partitions },
  } } };

});
