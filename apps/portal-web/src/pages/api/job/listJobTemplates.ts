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
import { JobServiceClient, JobTemplateInfo } from "@scow/protos/build/portal/job";
import { authenticate } from "src/auth/server";
import { getClient } from "src/utils/client";
import { route } from "src/utils/route";

export interface ListJobTemplatesSchema {

  method: "GET";

  query: {
    cluster: string;
  };

  responses: {
    200: {
      results: JobTemplateInfo[];
    }

    400: {
      message: string;
    }

    404: null;
   }
}

const auth = authenticate(() => true);

export default route<ListJobTemplatesSchema>("ListJobTemplatesSchema", async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { cluster } = req.query;

  const client = getClient(JobServiceClient);

  return asyncUnaryCall(client, "listJobTemplates", {
    userId: info.identityId, cluster,
  }).then(({ results }) => ({ 200: { results } }));

});
