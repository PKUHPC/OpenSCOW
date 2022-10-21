import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getClusterOps } from "src/clusterops";
import { NewJobInfo } from "src/clusterops/api/job";
import { JobServiceServer, JobServiceService } from "src/generated/portal/job";
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

      return [{ jobInfo: reply.jobInfo }];

    },

    listJobTemplates: async ({ request, logger }) => {

      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.job.listJobTemplates({
        userId,
      }, logger);

      return [{ results: reply.results }];

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
        userId, endTime, startTime,
      }, logger);

      return [{ results: reply.results }];

    },

    submitJob: async ({ request, logger }) => {
      const { cluster, command, jobName, coreCount, maxTime, saveAsTemplate, userId,
        nodeCount, partition, qos, account, comment, workingDirectory } = request;

      const jobInfo: NewJobInfo = {
        jobName,
        coreCount,
        maxTime,
        nodeCount,
        partition,
        qos,
        account,
        command,
        comment,
        workingDirectory,
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
        throw <ServiceError>{
          code: Status.INTERNAL, message: "sbatch failed", details: reply.message,
        };
      }

      return [{ jobId: reply.jobId }];
    },


  });

});
