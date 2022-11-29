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
import { authenticate } from "src/auth/server";
import { RunningJob } from "src/generated/common/job";
import { JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetRunningJobsSchema {

  method: "GET";

  query: {

    userId: string;

    cluster: string;
  }

  responses: {
    200: {
      results: RunningJob[];
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<GetRunningJobsSchema>("GetRunningJobsSchema", async (req, res) => {


  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, userId } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listRunningJobs", {
    cluster, userId,
  }).then(({ results }) => ({ 200: { results } }));

});
