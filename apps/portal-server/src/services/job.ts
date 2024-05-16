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
import { checkSchedulerApiVersion } from "@scow/lib-server";
import { createDirectoriesRecursively, sftpReadFile, sftpStat, sftpWriteFile } from "@scow/lib-ssh";
import { JobServiceServer, JobServiceService } from "@scow/protos/build/portal/job";
import { parseErrorDetails } from "@scow/rich-error-model";
import { ApiVersion } from "@scow/utils/build/version";
import path, { join } from "path";
import { getClusterOps } from "src/clusterops";
import { JobTemplate } from "src/clusterops/api/job";
import { callOnOne } from "src/utils/clusters";
import { clusterNotFound } from "src/utils/errors";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    cancelJob: async ({ request, logger }) => {

      const { cluster, jobId, userId } = request;

      await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.job, "cancelJob", {
          userId, jobId,
        }),
      );

      return [{}];

    },

    listAccounts: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.account, "listAccounts", {
          userId,
        }),
      );

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

    deleteJobTemplate: async ({ request, logger }) => {
      const { cluster, templateId, userId } = request;
      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      await clusterops.job.deleteJobTemplate({
        id: templateId, userId,
      }, logger);

      return [{}];
    },

    renameJobTemplate: async ({ request, logger }) => {
      const { cluster, templateId, userId, jobName } = request;
      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      await clusterops.job.renameJobTemplate({
        id: templateId, userId, jobName,
      }, logger);

      return [{}];
    },

    listRunningJobs: async ({ request, logger }) => {

      const { cluster, userId } = request;

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.job, "getJobs", {
          fields: [
            "job_id", "partition", "name", "user", "state", "elapsed_seconds",
            "nodes_alloc", "node_list", "reason", "account", "cpus_alloc", "gpus_alloc",
            "qos", "submit_time", "time_limit_minutes", "working_directory",
          ],
          filter: { users: [userId], accounts: [], states: ["PENDING", "RUNNING"]},
        }),
      );

      return [{ results: reply.jobs.map(jobInfoToRunningjob) }];
    },

    listAllJobs: async ({ request, logger }) => {
      const { cluster, userId, endTime, startTime } = request;

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.job, "getJobs", {
          fields: [
            "job_id", "name", "account", "partition", "qos", "state", "working_directory",
            "reason", "elapsed_seconds", "time_limit_minutes", "submit_time",
            "start_time", "end_time",
          ],
          filter: {
            users: [userId], accounts: [], states: [],
            submitTime: { startTime, endTime },
          },
        }),
      );

      return [{ results: reply.jobs.map(jobInfoToPortalJobInfo) }];

    },

    submitJob: async ({ request, logger }) => {
      const { cluster, command, jobName, coreCount, gpuCount, maxTime, saveAsTemplate, userId,
        nodeCount, partition, qos, account, comment, workingDirectory, output
        , errorOutput, memory, scriptOutput } = request;

      // make sure working directory exists
      const host = getClusterLoginNode(cluster);
      if (!host) { throw clusterNotFound(cluster); }
      await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();
        await createDirectoriesRecursively(sftp, workingDirectory);
      });

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => await asyncClientCall(client.job, "submitJob", {
          userId, jobName, account, partition: partition!, qos, nodeCount, gpuCount: gpuCount || 0,
          memoryMb: Number(memory?.split("M")[0]), coreCount, timeLimitMinutes: maxTime,
          script: command, workingDirectory, stdout: output, stderr: errorOutput, extraOptions: [],
        }).catch((e) => {
          const ex = e as ServiceError;
          const errors = parseErrorDetails(ex.metadata);
          if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "SBATCH_FAILED") {
            throw <ServiceError> {
              code: Status.INTERNAL,
              message: "sbatch failed",
              details: e.details,
            };
          } else {
            throw e;
          }
        }),
      );

      // 保存作业脚本
      if (scriptOutput) {
        await sshConnect(host, userId, logger, async (ssh) => {
          const sftp = await ssh.requestSFTP();
          const scriptPath = join(workingDirectory, scriptOutput);
          await sftpWriteFile(sftp)(scriptPath, reply.generatedScript);
        });
      }

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
          scriptOutput,
        };


        const clusterOps = getClusterOps(cluster);
        if (!clusterOps) { throw clusterNotFound(cluster); }

        logger.info("jobInfo: %o", jobInfo);
        await clusterOps.job.saveJobTemplate({
          userId, jobId: reply.jobId, jobInfo,
        }, logger);
      }
      return [{ jobId: reply.jobId }];
    },


    submitFileAsJob: async ({ request, logger }) => {
      const { cluster, userId, filePath } = request;

      const host = getClusterLoginNode(cluster);
      if (!host) { throw clusterNotFound(cluster); }

      const script = await sshConnect(host, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        // 判断文件操作权限
        const stat = await sftpStat(sftp)(filePath).catch((e) => {
          logger.error(e, "stat %s as %s failed", filePath, userId);
          throw <ServiceError> {
            code: Status.PERMISSION_DENIED, message: `${filePath} is not accessible`,
          };
        });
        // 文件SIZE大于1M不能提交sbatch执行
        if (stat.size / (1024 * 1024) > 1) {
          throw <ServiceError> {
            code: Status.INVALID_ARGUMENT, message: `${filePath} is too large. Maximum file size is 1M`,
          };
        }

        const isTextFile = await ssh.exec("file", [filePath]).then((res) => {
          return res.match(/text/);
        });
        // 文件不是文本文件不能提交Sbatch执行
        if (!isTextFile) {
          throw <ServiceError> {
            code: Status.INVALID_ARGUMENT, message: `${filePath} is not a text file`,
          };
        }

        return await sftpReadFile(sftp)(filePath)
          .then((buffer) => {
            return buffer.toString("utf-8");
          });
      });

      const scriptFileFullPath = path.dirname(filePath);

      const reply = await callOnOne(
        cluster,
        logger,
        async (client) => {

          // 当前接口要求的最低调度器接口版本
          const minRequiredApiVersion: ApiVersion = { major: 1, minor: 5, patch: 0 };

          // 检验调度器的API版本是否符合要求，不符合要求报错
          await checkSchedulerApiVersion(client, minRequiredApiVersion);

          return await asyncClientCall(client.job, "submitScriptAsJob", {
            userId, script, scriptFileFullPath,
          }).catch((e) => {
            const ex = e as ServiceError;
            const errors = parseErrorDetails(ex.metadata);
            if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "SBATCH_FAILED") {
              throw <ServiceError> {
                code: Status.INTERNAL,
                message: "sbatch failed",
                details: e.details,
              };
            } else {
              throw e;
            }
          });
        },

      );

      return [{ jobId: reply.jobId }];
    },


  });

});
