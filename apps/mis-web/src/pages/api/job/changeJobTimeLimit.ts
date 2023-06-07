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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { JobServiceClient } from "@scow/protos/build/server/job";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { checkJobAccessible } from "src/server/jobAccessible";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export type ChangeMode =
  | "INCREASE"
  | "DECREASE"

// 修改作业运行时限。
// 只有平台管理员、租户管理员、或者作业发起者本人、或者作业发起者所在账户的管理员或者拥有者可以修改
export const ChangeJobTimeLimitSchema = typeboxRouteSchema({
  method: "PATCH",

  body: Type.Object({
    cluster: Type.String(),

    jobId: Type.String(),

    /**
     * 时间变化，单位分钟
     * @type integer
     */
    delta: Type.Number(),
  }),

  responses: {
    204: Type.Null(),
    /** 用户不能修改这个作业的时限 */
    403: Type.Null(),
    /** 作业未找到 */
    404: Type.Null(),
  },
});

const auth = authenticate(() => true);

export default typeboxRoute(ChangeJobTimeLimitSchema,
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) { return; }

    const { cluster, delta, jobId } = req.body;

    const client = getClient(JobServiceClient);

    // check if the user can change the job time limit

    const jobAccessible = await checkJobAccessible(jobId, cluster, info);

    if (jobAccessible === "NotAllowed") {
      return { 403: null };
    } else if (jobAccessible === "NotFound") {
      return { 404: null };
    }

    return await asyncClientCall(client, "changeJobTimeLimit", {
      cluster,
      delta,
      jobId,
    })
      .then(() => ({ 204: null }))
      .catch(handlegRPCError({
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
