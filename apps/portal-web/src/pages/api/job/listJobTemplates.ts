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
import { JobServiceClient } from "@scow/protos/build/portal/job";
import { Static, Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

// Cannot use JobTemplateInfo from protos
export const JobTemplateInfo = Type.Object({
  id: Type.String(),
  jobName: Type.String(),
  submitTime: Type.Optional(Type.String()),
  comment: Type.Optional(Type.Union([Type.String(), Type.Undefined()])),
});

export type JobTemplateInfo = Static<typeof JobTemplateInfo>;
export const ListJobTemplatesSchema = typeboxRouteSchema({

  method: "GET",

  query: Type.Object({
    cluster: Type.String(),
  }),

  responses: {
    200: Type.Object({
      results: Type.Array(JobTemplateInfo),
    }),

    400: Type.Object({
      message: Type.String(),
    }),

    404: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default route(ListJobTemplatesSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listJobTemplates", {
    userId: info.identityId, cluster,
  }).then(({ results }) => ({ 200: { results } }));

});
