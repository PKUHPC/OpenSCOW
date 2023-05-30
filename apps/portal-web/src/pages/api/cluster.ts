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
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";
import { route } from "src/utils/route";

export const Partition = Type.Object({
  name: Type.String(),
  mem: Type.Number(),
  cores: Type.Number(),
  gpus: Type.Number(),
  nodes: Type.Number(),
  qos: Type.Optional(Type.Array(Type.String())),
  comment: Type.Optional(Type.String()),
});

export type Partition = Static<typeof Partition>;

export const PublicClusterConfig = Type.Object({
  submitJobDirTemplate: Type.String(),
  slurm: Type.Object({ partitions: Type.Array(Partition) }),
});

export type PublicClusterConfig = Static<typeof PublicClusterConfig>;

export const GetClusterInfoSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({
      clusterInfo: PublicClusterConfig,
    }),

    403: Type.Object({}),
  },
});

const auth = authenticate(() => true);

export default route(GetClusterInfoSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const clusterInfo = runtimeConfig.CLUSTERS_CONFIG[cluster];

  return { 200: { clusterInfo: {
    submitJobDirTemplate: runtimeConfig.SUBMIT_JOB_WORKING_DIR,
    slurm: { partitions: clusterInfo.slurm.partitions },
  } } };

});
