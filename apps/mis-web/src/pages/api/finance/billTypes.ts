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
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { BillServiceClient } from "@scow/protos/build/server/bill";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";


export const GetBillTypesSchema = typeboxRouteSchema({
  method: "GET",
  responses: {
    200: Type.Object({
      types: Type.Array(Type.String()),
    }),
  },
});

const auth = authenticate(() => true);

export default typeboxRoute(GetBillTypesSchema, async (req, res) => {

  await auth(req, res);
  const client = getClient(BillServiceClient);

  const reply = await asyncClientCall(client, "getBillTypes", {});

  return {
    200: {
      ...reply,
    },
  };
});
