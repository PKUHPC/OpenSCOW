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

import { typeboxRoute, typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { createOperationLogClient } from "@scow/lib-operation-log/build/index";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { runtimeConfig } from "src/utils/config";

export const I18nObjectSchema = Type.Optional(Type.Object({
  i18n: Type.Optional(Type.Object({
    default: Type.String(),
    en: Type.Optional(Type.String()),
    zhCn: Type.Optional(Type.String()),
  })),
}));

export type I18nObjectSchemaType = Static<typeof I18nObjectSchema>;

export const CustomEventTypeSchema = Type.Object({
  type: Type.String(),
  name: I18nObjectSchema,
});

export const GetCustomEventTypesSchema = typeboxRouteSchema({

  method: "GET",

  responses: {
    200: Type.Object({
      results: Type.Array(CustomEventTypeSchema),
    }),


    403: Type.Null(),
  },
});

export default typeboxRoute(GetCustomEventTypesSchema, async (req, res) => {
  const auth = authenticate(() => true);

  const info = await auth(req, res);

  if (!info) { return; }

  const { getCustomEventTypes } = createOperationLogClient(runtimeConfig.AUDIT_CONFIG, console);
  const resp = await getCustomEventTypes();

  const { customEventTypes } = resp;

  return {
    200: { results: customEventTypes },
  };
});
