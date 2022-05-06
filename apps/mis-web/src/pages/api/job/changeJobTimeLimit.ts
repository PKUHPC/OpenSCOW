import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { JobServiceClient } from "src/generated/server/job";
import { checkJobAccessible } from "src/server/jobAccessible";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export type ChangeMode =
  | "INCREASE"
  | "DECREASE"

// 修改作业运行时限。
// 只有平台管理员、租户管理员、或者作业发起者本人、或者作业发起者所在账户的管理员或者拥有者可以修改
export interface ChangeJobTimeLimitSchema {
  method: "PATCH";

  body: {
    cluster: string;

    jobId: string;

    /**
     * 时间变化，单位分钟
     * @type integer
     */
    delta: number;
  }

  responses: {
    204: null;
    /** 用户不能修改这个作业的时限 */
    403: null;
    /** 作业未找到 */
    404: null;
  }
}

const auth = authenticate(() => true);

export default route<ChangeJobTimeLimitSchema>("ChangeJobTimeLimitSchema",
  async (req, res) => {
    const info = await auth(req, res);
    if (!info) { return; }

    const { cluster, delta, jobId }  = req.body;

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
