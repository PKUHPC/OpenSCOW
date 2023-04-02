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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { JobServiceServer, JobServiceService } from "@scow/protos/build/portal/job";
import { getClusterOps } from "src/clusterops";
import { JobTemplate } from "src/clusterops/api/job";
import { clusterNotFound, jobNotFound } from "src/utils/errors";

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    cancelJob: async ({ request, logger }) => {

      const { cluster, jobId, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.cancelJob({
        jobId,
        userId,
      }, logger);

      if (reply.code === "NOT_FOUND") {
        throw jobNotFound(jobId);
      }

      return [{}];

    },

    listAccounts: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.listAccounts({
        userId,
      }, logger);

      return [{ accounts: reply.accounts }];
    },

    getJobTemplate: async ({ request, logger }) => {
      const { cluster, templateId, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.getJobTamplate({
        id: templateId, userId,
      }, logger);

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `Job template id ${templateId} is not found.` };
      }

      return [{ template: reply.template }];

    },

    listJobTemplates: async ({ request, logger }) => {

      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.listJobTemplates({
        userId,
      }, logger);

      return [{ results: reply.results.map((x) => ({ ...x, submitTime: x.submitTime?.toISOString() })) }];

    },

    listRunningJobs: async ({ request, logger }) => {

      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.listRunningJobs({
        userId,
      }, logger);

      return [{ results: reply.results }];
    },

    listAllJobs: async ({ request, logger }) => {
      const { cluster, userId, endTime, startTime } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.listAllJobsInfo({
        userId,
        endTime: endTime ? new Date(endTime) : undefined,
        startTime: startTime ? new Date(startTime) : undefined,
      }, logger);

      return [{ results: reply.results }];

    },

    submitJob: async ({ request, logger }) => {
      const { cluster, command, jobName, coreCount, gpuCount, maxTime, saveAsTemplate, userId,
        nodeCount, partition, qos, account, comment, workingDirectory, memory } = request;

      const jobInfo: JobTemplate = {
        jobName,
        coreCount,
        maxTime,
        nodeCount,
        gpuCount,
        partition,
        qos,
        account,
        command,
        comment,
        workingDirectory,
        memory,
      };

      const clusterops = getClusterOps(cluster);

      const scriptReply = await clusterops.job.generateJobScript({
        jobInfo,
      }, logger);

      const reply = await clusterops.job.submitJob({
        userId,
        jobInfo,
        script: scriptReply.script,
        saveAsTemplate,
      }, logger);

      if (reply.code === "SBATCH_FAILED") {
        throw new ServiceError({
          code: Status.INTERNAL,
          details: reply.message,
        });
      }

      return [{ jobId: reply.jobId }];
    },


  });

});
