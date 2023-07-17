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

import { plugin } from "@ddadaal/tsgrpc-server";
import { JobServiceServer, JobServiceService } from "@scow/scheduler-adapter-protos/build/protos/job";
import { clusterId } from "src/config/cluster";
import testData from "src/testData.json";

export const jobServiceServer = plugin((server) => {
  server.addService<JobServiceServer>(JobServiceService, {
    getJobs: async () => {
      return [{
        jobs: testData.filter((x) => x.cluster === clusterId)
          .map(({ tenant, tenantPrice, accountPrice, cluster, ...rest }) => {
            return {
              ...rest,
              state: "COMPLETED",
              workingDirectory: "",
            };
          }),
        // set this field for test
        totalCount : 20,
      }];
    },

    getJobById: async () => {
      return [{}];
    },

    changeJobTimeLimit: async () => {
      return [{}];
    },

    queryJobTimeLimit: async () => {
      return [{ timeLimitMinutes: 0 }];
    },

    submitJob: async () => {
      return [{ jobId: 1, generatedScript: "" }];
    },

    cancelJob: async () => {
      return [{}];
    },


  });

});
