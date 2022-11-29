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
import { JobInfo, JobServiceClient } from "src/generated/portal/job";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface GetAllJobsSchema {

  method: "GET";

  query: {
    cluster: string;
    startTime: string;
    endTime: string;
  }

  responses: {
    200: {
      results: JobInfo[];
    }

    403: null;
  }
}

const auth = authenticate(() => true);

export default route<GetAllJobsSchema>("GetAllJobsSchema", async (req, res) => {



  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster, startTime, endTime } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listAllJobs", {
    userId: info.identityId, cluster,
    startTime, endTime,
  }).then(({ results }) => ({ 200: { results } }));

});
