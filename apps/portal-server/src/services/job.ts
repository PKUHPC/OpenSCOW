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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ServiceError } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { jobInfoToPortalJobInfo, jobInfoToRunningjob } from "@scow/lib-scheduler-adapter";
import { JobServiceServer, JobServiceService } from "@scow/protos/build/portal/job";
import { getClusterOps } from "src/clusterops";
import { JobTemplate } from "src/clusterops/api/job";
import { getAdapterClient } from "src/utils/clusters";
import { clusterNotFound } from "src/utils/errors";

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    cancelJob: async ({ request }) => {

      const { cluster, jobId, userId } = request;

      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      await asyncClientCall(client.job, "cancelJob", {
        userId, jobId,
      });

      return [{}];

    },

    listAccounts: async ({ request }) => {
      const { cluster, userId } = request;

      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      const reply = await asyncClientCall(client.account, "listAccounts", {
        userId,
      });

      return [{ accounts: reply.accounts }];
    },

    getJobTemplate: async ({ request, logger }) => {
      const { cluster, templateId, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.getJobTemplate({
        id: templateId, userId,
      }, logger);

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

    listRunningJobs: async ({ request }) => {

      const { cluster, userId } = request;

      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      const reply = await asyncClientCall(client.job, "getJobs", {
        fields: [
          "job_id", "partition", "name", "user", "state", "elapsed_seconds",
          "nodes_alloc", "node_list", "reason", "account", "cpus_alloc",
          "qos", "submit_time", "time_limit_minutes", "working_directory",
        ],
        filter: { users: [userId], accounts: [], states: ["PENDING", "RUNNING"]},
      });

      return [{ results: reply.jobs.map(jobInfoToRunningjob) }];
    },

    listAllJobs: async ({ request }) => {
      const { cluster, userId, endTime, startTime } = request;

      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      const reply = await asyncClientCall(client.job, "getJobs", {
        fields: [
          "job_id", "name", "account", "partition", "qos", "state", "working_directory",
          "reason", "elapsed_seconds", "time_limit_minutes", "submit_time",
          "start_time", "end_time",
        ],
        filter: {
          users: [userId], accounts: [], states: [],
          submitTime: { startTime, endTime },
        },
      });

      return [{ results: reply.jobs.map(jobInfoToPortalJobInfo) }];

    },

    submitJob: async ({ request, logger }) => {
      const { cluster, command, jobName, coreCount, gpuCount, maxTime, saveAsTemplate, userId,
        nodeCount, partition, qos, account, comment, workingDirectory, output, errorOutput, memory } = request;


      const client = getAdapterClient(cluster);
      if (!client) { throw clusterNotFound(cluster); }

      const reply = await asyncClientCall(client.job, "submitJob", {
        userId, jobName, account, partition: partition!, qos, nodeCount, gpuCount: gpuCount || 0,
        memoryMb: Number(memory?.split("M")[0]), coreCount, timeLimitMinutes: maxTime,
        script: command, workingDirectory, stdout: output, stderr: errorOutput, extraOptions: [],
      }).catch((e) => {
        // TODO: check error format
        if (e.code === Status.UNKNOWN && e.details.reason === "SBATCH_FAILED") {
          throw <ServiceError> {
            code: Status.INTERNAL,
            message: "sbatch failed",
            details: e.details.metadata["reason"],
          };
        } else {
          throw e;
        }
      });

      if (saveAsTemplate) {
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
          output,
          errorOutput,
          memory,
        };

        const clusterOps = getClusterOps(cluster);
        if (!clusterOps) { throw clusterNotFound(cluster); }

        await clusterOps.job.saveJobTemplate({
          userId, jobId: reply.jobId, jobInfo,
        }, logger);
      }

      return [{ jobId: reply.jobId }];
    },

  });

});
