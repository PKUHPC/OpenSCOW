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
import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { UserServiceClient } from "@scow/protos/build/portal/user";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export const EntryType = Type.Enum({
  STATIC : 0,
  APP : 1,
  SHELL : 2,
});
export type EntryType = Static<typeof EntryType>;

export const QuickEntry = Type.Object({
  id:Type.String(),
  name:Type.String(),
  path:Type.String(),
  entryType: EntryType,
  needCluster:Type.Optional(Type.Boolean()),
  icon:Type.Optional(Type.String()),
  logoPath:Type.Optional(Type.String()),
  cluster:Type.Optional(Type.Object({
    id: Type.String(),
    name: Type.String(),
  })),
  loginNode:Type.Optional(Type.String()),
});

export type QuickEntry = Static<typeof QuickEntry>;

export const GetQuickEntrySchema = typeboxRouteSchema({
  method: "GET",

  responses: {
    200: Type.Object({
      quickEntry: Type.Array(QuickEntry),
    }),

    404: Type.Object({ code: Type.Literal("READ_FILE_FAILED") }),
  },
});

const auth = authenticate(() => true);

export default route(GetQuickEntrySchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(UserServiceClient);

  return await asyncUnaryCall(client, "getQuickEntry", {
    userId:info.identityId,
  }).then(async (x) => {

    return { 200: { quickEntry: x.quickEntry } };
  },
  handlegRPCError({
    [status.UNAVAILABLE]: () => ({ 404: { code: "READ_FILE_FAILED" } } as const),
  }),
  );

});
