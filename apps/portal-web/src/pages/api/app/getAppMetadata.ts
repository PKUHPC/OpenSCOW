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
import { status } from "@grpc/grpc-js";
import { appCustomAttribute_AttributeTypeToJSON, AppServiceClient } from "@scow/protos/build/portal/app";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export const SelectOption = Type.Object({
  value: Type.String(),
  label: Type.String(),
});
export type SelectOption = Static<typeof SelectOption>;

// Cannot use AppCustomAttribute from protos
export const AppCustomAttribute = Type.Object({
  type: Type.Union([
    Type.Literal("NUMBER"),
    Type.Literal("SELECT"),
    Type.Literal("TEXT"),
  ]),
  label: Type.String(),
  name: Type.String(),
  required: Type.Boolean(),
  placeholder: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
  defaultValue: Type.Optional(Type.Union([
    Type.String(),
    Type.Number(),
    Type.Undefined(),
  ])),
  select: Type.Array(SelectOption),
});
export type AppCustomAttribute = Static<typeof AppCustomAttribute>;

export const GetAppMetadataSchema = typeboxRouteSchema({
  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
    appId: Type.String(),
  }),

  responses: {
    200: Type.Object({
      appName: Type.String(),
      appCustomFormAttributes: Type.Array(AppCustomAttribute),
    }),

    // appId not exists
    404: Type.Object({ code: Type.Literal("APP_NOT_FOUND") }),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/typeboxRoute(GetAppMetadataSchema, async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { appId, cluster } = req.query;

  const client = getClient(AppServiceClient);

  return asyncUnaryCall(client, "getAppMetadata", { appId, cluster }).then((reply) => {
    const attributes: AppCustomAttribute[] = reply.attributes.map((item) => ({
      type: appCustomAttribute_AttributeTypeToJSON(item.type) as AppCustomAttribute["type"],
      label: item.label,
      name: item.name,
      select: item.options,
      required: item.required,
      defaultValue: item.defaultInput
        ? (item.defaultInput?.$case === "text" ? item.defaultInput.text : item.defaultInput.number)
        : undefined,
      placeholder: item.placeholder,
    }));
    return { 200: { appName: reply.appName, appCustomFormAttributes: attributes } };
  }, handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "APP_NOT_FOUND" } } as const),
  }));

});
