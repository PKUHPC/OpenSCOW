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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { ConfigServiceClient } from "@scow/protos/build/common/config";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";

export const Partition = Type.Object({
  name: Type.String(),
  memMb: Type.Number(),
  cores: Type.Number(),
  gpus: Type.Number(),
  nodes: Type.Number(),
  qos: Type.Optional(Type.Array(Type.String())),
  comment: Type.Optional(Type.String()),
});

export type Partition = Static<typeof Partition>;

export const GetAvailablePartitionsSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    accountName: Type.String(),
    userId: Type.String(),
  }),

  responses: {
    200: Type.Object({
      partitions: Type.Array(Partition),
    }),

    403: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default typeboxRoute(GetAvailablePartitionsSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, accountName, userId } = req.query;

  const client = getClient(ConfigServiceClient);

  const reply = await asyncUnaryCall(client, "getAvailablePartitions", {
    cluster, accountName, userId,
  });

  return { 200: {
    partitions: reply.partitions,
  } };

});
