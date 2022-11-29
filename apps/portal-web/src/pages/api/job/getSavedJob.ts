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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { JobServiceClient, NewJobInfo } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";
import { handlegRPCError } from "src/utils/server";

export interface GetSavedJobSchema {

  method: "GET";

  query: {
    cluster: string;
    id: string;
  };

  responses: {
    200: {
      jobInfo: NewJobInfo;
    }

    400: {
      message: string;
    }

    404: { code: "TEMPLATE_NOT_FOUND" };

   }
}

const auth = authenticate(() => true);

export default route<GetSavedJobSchema>("GetSavedJobSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, id } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "getJobTemplate", {
    userId: info.identityId, cluster, templateId: id,
  }).then(({ jobInfo }) => ({ 200: { jobInfo: jobInfo! } }), handlegRPCError({
    [status.NOT_FOUND]: () => ({ 404: { code: "TEMPLATE_NOT_FOUND" } as const }),
  }));


});
