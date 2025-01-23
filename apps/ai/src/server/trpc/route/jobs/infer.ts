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
import { ServiceError } from "@grpc/grpc-js";
import { OperationResult, OperationType } from "@scow/lib-operation-log";
import {
  getUserHomedir,
  sftpExists,
  sftpLstat,
  sftpReadFile,
  sftpWriteFile,
} from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import dayjs from "dayjs";
import { join } from "path";
import { JobType } from "src/models/Job";
import { aiConfig } from "src/server/config/ai";
import { callLog } from "src/server/setup/operationLog";
import { procedure } from "src/server/trpc/procedure/base";
import { checkCreateAppEntity, fetchJobInputParams, validateUniquePaths } from "src/server/utils/app";
import { checkClusterAvailable, getAdapterClient } from "src/server/utils/clusters";
import { clusterNotFound } from "src/server/utils/errors";
import { forkEntityManager } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { isParentOrSameFolder } from "src/utils/file";
import { parseIp } from "src/utils/parse";
import { z } from "zod";

import { getCurrentClusters } from "../../../utils/clusters";

const SESSION_METADATA_NAME = "session.json";



// 分布式训练框架
export const Framework = z.union([
  z.literal("tensorflow"),
  z.literal("pytorch"),
  z.literal("mindspore"),
]);

export type FrameworkType = z.infer<typeof Framework>;


// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ImageSchema = z.object({
  name: z.string(),
  tag: z.string().optional(),
});

export type Image = z.infer<typeof ImageSchema>;

interface SessionMetadata {
  sessionId: string;
  jobName: string;
  jobId: number;
  submitTime: string;
  image: Image;
  jobType: JobType;
  containerServicePort: number;
}

const InferenceJobInputSchema = z.object({
  clusterId: z.string(),
  InferenceJobName: z.string(),
  image: z.number().optional(),
  remoteImageUrl: z.string().optional(),
  isModelPrivate: z.boolean().optional(),
  model: z.number().optional(),
  mountPoints: z.array(z.string()).optional(),
  account: z.string(),
  partition: z.string().optional(),
  coreCount: z.number(),
  nodeCount: z.number(),
  gpuCount: z.number().optional(),
  memory: z.number().optional(),
  maxTime: z.number(),
  command: z.string(),
  gpuType: z.string().optional(),
  // 容器内服务端口
  containerServicePort:z.number(),
});

export type InferenceJobInput = z.infer<typeof InferenceJobInputSchema>;

export const submitInferJob =
procedure
  .meta({
    openapi: {
      method: "POST",
      path: "/infer",
      tags: ["infer"],
      summary: "Submit A Inference Job",
    },
  })
  .input(InferenceJobInputSchema)
  .output(z.object({
    jobId: z.number(),
  }))
  .use(async ({ input:{ clusterId }, ctx, next }) => {
    const res = await next({ ctx });

    const { user, req } = ctx;
    const logInfo = {
      operatorUserId: user.identityId,
      operatorIp: parseIp(req) ?? "",
      operationTypeName: OperationType.createAiInferenceJob,
    };

    if (res.ok) {
      await callLog({ ...logInfo, operationTypePayload:
      { clusterId, jobId:(res.data as any).jobId } },
      OperationResult.SUCCESS);
    }

    if (!res.ok) {
      await callLog({ ...logInfo, operationTypePayload:
      { clusterId } },
      OperationResult.FAIL);
    }

    return res;
  })
  .mutation(
    async ({ input, ctx: { user } }) => {
      const { clusterId, InferenceJobName , image,
        remoteImageUrl, isModelPrivate, model, mountPoints = [], account, partition, coreCount,
        nodeCount, gpuCount, memory, maxTime, command, gpuType,containerServicePort } = input;

      if (InferenceJobName.length > 42) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "The length of InferenceJobName should not exceed 42",
        });
      }
      const userId = user.identityId;

      const currentClusterIds = await getCurrentClusters(userId);
      checkClusterAvailable(currentClusterIds, clusterId);

      const host = getClusterLoginNode(clusterId);
      if (!host) {
        throw clusterNotFound(clusterId);
      }

      const client = getAdapterClient(clusterId);

      const em = await forkEntityManager();
      const {
        modelVersion,
        image: existImage,
      } = await checkCreateAppEntity({
        em,
        dataset:undefined,
        algorithm:undefined,
        image,
        model,
      });

      return await sshConnect(host, userId, logger, async (ssh) => {

        const homeDir = await getUserHomedir(ssh, userId, logger);
        const sftp = await ssh.requestSFTP();

        mountPoints.forEach((mountPoint) => {
          if (mountPoint && !isParentOrSameFolder(homeDir, mountPoint)) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "mountPoint should be in homeDir",
            });
          }
        });

        const scowWorkDirectoryName = `${clusterId}-job-${dayjs().format("YYYYMMDD-HHmmss")}`;
        const trainJobsDirectory = join(aiConfig.appJobsDir, scowWorkDirectoryName);

        // 确保所有映射到容器的路径都不重复
        validateUniquePaths([
          trainJobsDirectory,
          isModelPrivate ? modelVersion?.privatePath : modelVersion?.path,
          ...mountPoints,
        ]);

        // 检查挂载点是否为目录，不能是软链接
        for (const path of mountPoints) {
          const lstat = await sftpLstat(sftp)(path).catch((e) => {
            logger.error(e, "lstat %s as %s failed", path, userId);
            throw new TRPCError({ code: "FORBIDDEN", message: `${path} is not accessible` });
          });

          if (lstat.isSymbolicLink()) {
            throw new TRPCError({ code: "FORBIDDEN", message: `${path} is a symbolic link, not a directory` });
          }
        }

        // make sure trainJobsDirectory exists.
        await ssh.mkdir(trainJobsDirectory);
        const remoteEntryPath = join(homeDir, trainJobsDirectory, "entry.sh");

        const entryScript = command;
        await sftpWriteFile(sftp)(remoteEntryPath, entryScript);

        const reply = await asyncClientCall(client.job, "submitInferJob", {
          userId,
          jobName: InferenceJobName,
          account,
          partition: partition!,
          coreCount,
          nodeCount,
          gpuCount: gpuCount ?? 0,
          memoryMb: Number(memory),
          timeLimitMinutes: maxTime,
          workingDirectory: trainJobsDirectory,
          script: remoteEntryPath,
          // 对于AI模块，需要传递的额外参数
          // 第一个参数为镜像地址
          // 第二个参数为模型版本地址
          // 第三个参数为多挂载点地址，以逗号分隔
          // 第四个参数为gpuType, 表示训练时硬件卡的类型，由getClusterConfig接口获取
          // 第五个参数为多挂载点地址，以逗号分隔 (此挂载点是只读的)
          extraOptions: [
            remoteImageUrl || existImage?.path || "",
            modelVersion
              ? isModelPrivate
                ? modelVersion.privatePath
                : modelVersion.path
              : "",
            mountPoints.join(","),
            gpuType || "",
            aiConfig.publicMountPoints ? aiConfig.publicMountPoints.join(",") : "",
          ],
          containerServicePort,
        }).catch((e) => {
          const ex = e as ServiceError;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Submit infer job failed, ${ex.details}`,
          });
        });

        // Save session metadata
        const metadata: SessionMetadata = {
          jobId: reply.jobId,
          jobName:InferenceJobName,
          sessionId: scowWorkDirectoryName,
          submitTime: new Date().toISOString(),
          image: {
            name: remoteImageUrl || existImage!.name,
            tag: existImage?.tag || "latest",
          },
          jobType: JobType.INFER,
          containerServicePort,
        };
        await sftpWriteFile(sftp)(join(trainJobsDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));

        // 保存提交参数
        await sftpWriteFile(sftp)(join(trainJobsDirectory, `${reply.jobId}-input.json`), JSON.stringify(input));

        return { jobId: reply.jobId };
      });
    },
  );

export const getSubmitInferenceParams =
procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/infer/{jobId}/submissionParameters",
      tags: ["jobs"],
      summary: "Get Submit Infer Job Parameters",
    },
  })
  .input(z.object({
    clusterId: z.string(),
    jobId: z.number(),
    sessionId: z.string(),
  }))
  .output(InferenceJobInputSchema)
  .query(async ({ input, ctx: { user } }) => {
    const { clusterId, jobId, sessionId } = input;
    const userId = user.identityId;

    const currentClusterIds = await getCurrentClusters(userId);
    checkClusterAvailable(currentClusterIds, clusterId);

    const host = getClusterLoginNode(clusterId);
    if (!host) throw new TRPCError({ code: "NOT_FOUND", message: `Cluster ${clusterId} not found.` });

    return await sshConnect(host, userId, logger, async (ssh) => {

      const homeDir = await getUserHomedir(ssh, userId, logger);
      const jobsDirectory = join(aiConfig.appJobsDir, sessionId);

      const sftp = await ssh.requestSFTP();

      // 读取作业信息
      const metadataPath = join(jobsDirectory, SESSION_METADATA_NAME);

      if (!await sftpExists(sftp, metadataPath)) {
        return {} as InferenceJobInput;
      }

      const content = await sftpReadFile(sftp)(metadataPath);
      const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

      if (sessionMetadata.jobType !== JobType.INFER) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Job type of job ${jobId} is not Infer`,
        });
      }

      const inputParamsPath = join(homeDir, jobsDirectory, `${jobId}-input.json`);

      return await fetchJobInputParams<InferenceJobInput>(
        inputParamsPath, sftp, InferenceJobInputSchema, logger,
      );
    });
  });
