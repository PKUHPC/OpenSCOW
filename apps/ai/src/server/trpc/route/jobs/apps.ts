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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AppType } from "@scow/config/build/appForAi";
import { getPlaceholderKeys } from "@scow/lib-config/build/parse";
import { formatTime } from "@scow/lib-scheduler-adapter";
import { checkSchedulerApiVersion } from "@scow/lib-server/build/app";
import {
  getUserHomedir,
  loggedExec,
  sftpExists,
  sftpReaddir,
  sftpReadFile,
  sftpRealPath,
  sftpWriteFile,
} from "@scow/lib-ssh";
import { JobInfo } from "@scow/scheduler-adapter-protos/build/protos/job";
import { ApiVersion } from "@scow/utils/build/version";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import { join } from "path";
import { Logger } from "pino";
import { quote } from "shell-quote";
import { JobType } from "src/models/Job";
import { aiConfig } from "src/server/config/ai";
import { Image as ImageEntity, Source } from "src/server/entities/Image";
import { procedure } from "src/server/trpc/procedure/base";
import { checkAppExist, checkCreateAppEntity, getClusterAppConfigs } from "src/server/utils/app";
import { getAdapterClient } from "src/server/utils/clusters";
import { clusterNotFound } from "src/server/utils/errors";
import { forkEntityManager } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { paginate, paginationSchema } from "src/server/utils/pagination";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { isPortReachable } from "src/utils/isPortReachable";
import { BASE_PATH } from "src/utils/processEnv";
import { z } from "zod";

const ImageSchema = z.object({
  name: z.string(),
  tag: z.string().optional(),
});

export type Image = z.infer<typeof ImageSchema>

const JobTypeSchema = z.nativeEnum(JobType);

const AppSessionSchema = z.object({
  sessionId: z.string(),
  jobId: z.number(),
  submitTime: z.string(),
  jobType: JobTypeSchema,
  image: ImageSchema,
  appId: z.string().optional(),
  appName: z.string().optional(),
  state: z.string(),
  dataPath: z.string(),
  runningTime: z.string(),
  timeLimit: z.string(),
  reason: z.string().optional(),
  host: z.string().optional(),
  port: z.number().optional(),
});

export type AppSession = z.infer<typeof AppSessionSchema>;

interface ServerSessionInfoData {
  [key: string]: string | number;
  HOST: string;
  PORT: number;
  PASSWORD: string;
}

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId?: string;
  submitTime: string;
  image: Image;
  jobType: JobType
}

// 这些逻辑和portal-server是一样的吧？看看能不能抽象到libs/server下
const SERVER_ENTRY_COMMAND = fs.readFileSync("assets/app/server_entry.sh", { encoding: "utf-8" });

const SESSION_METADATA_NAME = "session.json";

// 适配器将该文件写在了/tmp目录下
const SERVER_SESSION_INFO = "/tmp/server_session_info.json";

const getEnvVariables = (env: Record<string, string>) =>
  Object.keys(env).map((x) => `export ${x}=${quote([env[x] ?? ""])}\n`).join("");

const getAppConnectionInfoFromAdapter = async (cluster: string, jobId: number, logger: Logger) => {
  const client = getAdapterClient(cluster);
  const minRequiredApiVersion: ApiVersion = { major: 1, minor: 3, patch: 0 };
  try {
    await checkSchedulerApiVersion(client, minRequiredApiVersion);
    // get connection info
    // for apps running in containers, it can provide real ip and port info
    const connectionInfo = await asyncClientCall(client.app, "getAppConnectionInfo", {
      jobId: jobId,
    });
    return connectionInfo;
  } catch (e: any) {
    if (e.code === Status.UNIMPLEMENTED || e.code === Status.FAILED_PRECONDITION) {
      logger.warn(e.details);
    } else {
      throw e;
    }
  }

};

export const appSchema = z.object({ id: z.string(), name: z.string(), logoPath: z.string().optional() });

export type AppSchema = z.infer<typeof appSchema>;

const I18nStringSchema = z.union([
  z.string(),
  z.object({
    i18n: z.object({
      default: z.string(),
      en: z.string().optional(),
      zh_cn: z.string().optional(),
    }),
  }),
]);

export type I18nStringType = z.infer<typeof AttributeTypeSchema>;

const SelectOptionSchema = z.object({
  value: z.string(),
  label: I18nStringSchema,
  requireGpu: z.boolean().optional(),
});

const AppCustomAttributeSchema = z.object({
  type: z.union([
    z.literal("NUMBER"),
    z.literal("SELECT"),
    z.literal("TEXT"),
  ]),
  label: I18nStringSchema,
  name: z.string(),
  required: z.boolean(),
  placeholder: I18nStringSchema.optional(),
  defaultValue: z.union([
    z.string(),
    z.number(),
  ]).optional(),
  select: z.array(SelectOptionSchema),
});

export type AppCustomAttribute = z.infer<typeof AppCustomAttributeSchema>;

const AttributeTypeSchema = z.enum(["TEXT", "NUMBER", "SELECT"]);

export type AttributeType = z.infer<typeof AttributeTypeSchema>;


export const listAvailableApps = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/apps",
      tags: ["app"],
      summary: "List all Available Apps",
    },
  })
  .input(z.object({ clusterId: z.string() }))
  .output(z.object({ apps: z.array(appSchema) }))
  .query(async ({ input }) => {
    const { clusterId } = input;
    const apps = getClusterAppConfigs(clusterId);

    return {
      apps: Object.keys(apps)
        .map((x) => ({ id: x, name: apps[x].name, logoPath: apps[x].logoPath || undefined })),
    };
  });

export const getAppMetadata = procedure
  .meta({
    openapi: {
      // GET /apps/{appId}
      method: "GET",
      path: "/jobs/getAppMetadata",
      tags: ["jobs"],
      summary: "Get App Metadata",
    },
  })
  .input(z.object({ clusterId: z.string(), appId: z.string() }))
  .output(z.object({
    appName: z.string(),
    appImage: z.object({
      name: z.string(),
      tag: z.string(),
    }),
    attributes: z.array(AppCustomAttributeSchema),
    appComment: I18nStringSchema.optional(),
  }))
  .query(async ({ input }) => {
    const { clusterId, appId } = input;

    const apps = getClusterAppConfigs(clusterId);
    const app = checkAppExist(apps, appId);

    const attributes: AppCustomAttribute[] = [];

    if (app.attributes) {
      app.attributes.forEach((item) => {
        const attributeType = item.type.toUpperCase() as AttributeType;
        attributes.push({
          type: attributeType,
          label: item.label,
          name: item.name,
          required: item.required,
          defaultValue: item.defaultValue,
          placeholder: item.placeholder,
          select: item.select?.map((x) => {
            return {
              value: x.value,
              label:x.label,
              requireGpu: x.requireGpu,
            };
          }) ?? [],
        });
      });
    }

    const comment = app.appComment ?? "";

    return { appName: app.name, appImage: app.image, attributes, appComment: comment };
  });

export const createAppSession = procedure
  // openAPI定义？
  // POST /appSessions
  .input(z.object({
    clusterId: z.string(),
    appId: z.string(),
    appJobName: z.string(),
    algorithm: z.number().optional(),
    image: ImageSchema,
    dataset: z.number().optional(),
    model: z.number().optional(),
    mountPoint: z.string().optional(),
    account: z.string(),
    partition: z.string().optional(),
    coreCount: z.number(),
    nodeCount: z.number(),
    gpuCount: z.number().optional(),
    memory: z.number().optional(),
    maxTime: z.number(),
    workingDirectory: z.string().optional(),
    customAttributes: z.record(z.string(), z.union([z.number(), z.string(), z.undefined()])),
  })).mutation(async ({ input, ctx: { user } }) => {
    const { clusterId, appId, appJobName, algorithm, image,
      dataset, model, mountPoint, account, partition, coreCount, nodeCount, gpuCount, memory,
      maxTime, workingDirectory, customAttributes } = input;

    const apps = getClusterAppConfigs(clusterId);
    const app = checkAppExist(apps, appId);

    const proxyBasePath = join(BASE_PATH, "/api/proxy", clusterId);
    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${appId} is not found`,
      });
    }
    const attributesConfig = app.attributes;
    attributesConfig?.forEach((attribute) => {
      if (attribute.required && !(attribute.name in customAttributes)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `custom form attribute ${attribute.name} is required but not found`,
        });
      }

      switch (attribute.type) {
      case "number":
        if (customAttributes[attribute.name] && Number.isNaN(Number(customAttributes[attribute.name]))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `custom form attribute ${
              attribute.name} should be of type number, but of type ${typeof customAttributes[attribute.name]}`,
          });
        }
        break;

      case "text":
        break;

      case "select":
        // check the option selected by user is in select attributes as the config defined
        if (customAttributes[attribute.name]
          && !(attribute.select!.some((optionItem) => optionItem.value === customAttributes[attribute.name]))) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: `
              the option value of ${attribute.name} selected by user should be
              one of select attributes as the ${appId} config defined,
              but is ${customAttributes[attribute.name]}`,
          });
        }
        break;

      default:
        throw new Error(`
        the custom form attributes type in ${appId} config should be one of number, text or select,
        but the type of ${attribute.name} is ${attribute.type}`);
      }
    });

    const em = await forkEntityManager();

    const {
      datasetVersion,
      algorithmVersion,
      modelVersion,
    } = await checkCreateAppEntity({
      em,
      dataset,
      algorithm,
      model,
    });


    const host = getClusterLoginNode(clusterId);
    if (!host) {
      throw clusterNotFound(clusterId);
    }

    const userId = user.identityId;
    return await sshConnect(host, userId, logger, async (ssh) => {

      const homeDir = await getUserHomedir(ssh, userId, logger);

      const appJobsDirectory = join(aiConfig.appJobsDir, appJobName);

      // make sure appJobsDirectory exists.
      await ssh.mkdir(appJobsDirectory);
      const sftp = await ssh.requestSFTP();
      const remoteEntryPath = join(homeDir, appJobsDirectory, "entry.sh");

      let customAttributesExport: string = "";
      for (const key in customAttributes) {

        const quotedAttribute = quote([customAttributes[key]?.toString() ?? ""]);

        const envItem = `export ${key}=${quotedAttribute}`;
        customAttributesExport = customAttributesExport + envItem + "\n";
      }

      if (app.type === "web") {
        const runtimeVariables = getEnvVariables({
          PROXY_BASE_PATH: join(proxyBasePath, app.web!.proxyType),
          SERVER_SESSION_INFO,
        });
        // SVCPORT 是k8s集群中service的端口, 由适配器提供
        let customForm = String.raw`\"HOST\":\"$HOST\",\"PORT\":$SVCPORT`;
        for (const key in app.web!.connect.formData) {
          const texts = getPlaceholderKeys(app.web!.connect.formData[key]);
          for (const i in texts) {
            customForm += `,\\\"${texts[i]}\\\":\\\"$${texts[i]}\\\"`;
          }
        }
        const sessionInfo = `echo -e "{${customForm}}" >$SERVER_SESSION_INFO\n`;

        const beforeScript = runtimeVariables + customAttributesExport + app.web!.beforeScript + sessionInfo;
        const webScript = app.web!.script;
        const entryScript = SERVER_ENTRY_COMMAND + beforeScript + webScript;

        // 将entry.sh写入后将路径传给适配器后启动容器
        await sftpWriteFile(sftp)(remoteEntryPath, entryScript);

        const client = getAdapterClient(clusterId);
        const reply = await asyncClientCall(client.job, "submitJob", {
          userId,
          jobName: appJobName,
          image: `${image.name}:${image.tag || "latest"}`,
          algorithm: algorithmVersion?.path,
          dataset: datasetVersion?.path,
          model: modelVersion?.path,
          mountPoint,
          account,
          partition: partition!,
          coreCount,
          nodeCount,
          gpuCount: gpuCount ?? 0,
          memoryMb: memory,
          timeLimitMinutes: maxTime,
          // 用户指定应用工作目录，如果不存在，则默认为用户的appJobsDirectory
          workingDirectory: workingDirectory ?? appJobsDirectory,
          script: remoteEntryPath,
          // 约定第一个参数确定是创建应用or训练任务，第二个参数为创建应用时的appId
          extraOptions: [JobType.APP, "web"],
        }).catch((e) => {
          const ex = e as ServiceError;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `submit job failed, ${ex.message}`,
            cause: ex.details,
          });
        });

        const metadata: SessionMetadata = {
          jobId: reply.jobId,
          sessionId: appJobName,
          submitTime: new Date().toISOString(),
          appId,
          image: image,
          jobType: JobType.APP,
        };
        await sftpWriteFile(sftp)(join(appJobsDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));

        return { jobId: reply.jobId };
      }
    });

  });


// POST /jobs/{jobId}/saveImage
export const saveImage =
  procedure
    .input(z.object({
      clusterId: z.string(),
      jobId: z.number(),
      imageName: z.string(),
      imageTag: z.string(),
      imageDesc: z.string().optional(),
    })).mutation(
      async ({ input, ctx: { user } }) => {
        const userId = user.identityId;
        const { clusterId, jobId, imageName, imageTag, imageDesc } = input;

        // 检查镜像在数据库中是否重复
        const em = await forkEntityManager();
        const existImage = await em.findOne(ImageEntity, { owner: userId, name: imageName, tag: imageTag });
        if (existImage) {
          throw new TRPCError({
            code: "CONFLICT",
            message: `Image with name: ${imageName} and tag: ${imageTag} of user: ${userId} already exists.`,
          });
        }
        // 根据jobId获取该应用运行在集群的节点和对应的containerId
        const client = getAdapterClient(clusterId);

        const { node, containerId } = await asyncClientCall(client.app, "getRunningJobNodeInfo", {
          jobId,
        });
        const formateContainerId = containerId.replace("docker://", "");
        const { url, project, user: harborUser, password } = aiConfig.harborConfig;
        // 连接到该节点
        return await sshConnect(node, "root", logger, async (ssh) => {
          try {
            const harborImageUrl = `${url}/${project}/${userId}/${imageName}:${imageTag}`;
            const localImageUrl = `${userId}/${imageName}:${imageTag}`;

            // 检查该容器是否存在
            const resp = await loggedExec(ssh, logger, true, "docker",
              ["ps", "--no-trunc", "|", "grep", formateContainerId]);

            if (!resp.stdout) {
              throw new TRPCError({
                code: "NOT_FOUND",
                message: `Can not find the container: ${formateContainerId} in node ${node}`,
              });
            }
            // 用新名字commit镜像
            await loggedExec(ssh, logger, true, "docker",
              ["commit", formateContainerId, `${userId}/${imageName}:${imageTag}`]);

            // docker login harbor
            await loggedExec(ssh, logger, true, "docker", ["login", url, "-u", harborUser, "-p", password]);

            // docker tag
            await loggedExec(ssh, logger, true, "docker", ["tag", localImageUrl, harborImageUrl]);

            // push 镜像至harbor
            await loggedExec(ssh, logger, true, "docker", ["push", harborImageUrl]);

            // 清除本地镜像
            await loggedExec(ssh, logger, true, "docker", ["rmi", harborImageUrl]);
            await loggedExec(ssh, logger, true, "docker", ["rmi", localImageUrl]);

            // 数据库添加image

            const newImage = new ImageEntity({
              name: imageName,
              tag: imageTag,
              description: imageDesc,
              path: harborImageUrl,
              owner: userId,
              source: Source.EXTERNAL,
              sourcePath: harborImageUrl,
            });
            await em.persistAndFlush(newImage);
          } catch (e) {
            const ex = e as ServiceError;
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: `Save image failed, ${ex.message}`,
              cause: ex.details,
            });
          }
        });
      },
    );

// 这个是新建一个job？
// POST /jobs
export const trainJob =
procedure
  .input(z.object({
    clusterId: z.string(),
    trainJobName: z.string(),
    algorithm: z.number().optional(),
    imageId: z.number(),
    dataset: z.number().optional(),
    model: z.number().optional(),
    mountPoint: z.string().optional(),
    account: z.string(),
    partition: z.string().optional(),
    coreCount: z.number(),
    nodeCount: z.number(),
    gpuCount: z.number().optional(),
    memory: z.number().optional(),
    maxTime: z.number(),
    command: z.string(),
  }))
  .output(z.object({
    jobId: z.number(),
  })).mutation(
    async ({ input, ctx: { user } }) => {

      const { clusterId, trainJobName, algorithm, imageId, dataset, model, mountPoint, account, partition,
        coreCount, nodeCount, gpuCount, memory, maxTime, command } = input;
      const userId = user.identityId;

      const host = getClusterLoginNode(clusterId);
      if (!host) {
        throw clusterNotFound(clusterId);
      }

      const em = await forkEntityManager();
      const {
        datasetVersion,
        algorithmVersion,
        modelVersion,
        image,
      } = await checkCreateAppEntity({
        em,
        dataset,
        algorithm,
        image: imageId,
        model,
      });

      return await sshConnect(host, userId, logger, async (ssh) => {

        const homeDir = await getUserHomedir(ssh, userId, logger);

        const trainJobsDirectory = join(aiConfig.appJobsDir, trainJobName);

        // make sure trainJobsDirectory exists.
        await ssh.mkdir(trainJobsDirectory);
        const sftp = await ssh.requestSFTP();
        const remoteEntryPath = join(homeDir, trainJobsDirectory, "entry.sh");

        const entryScript = command;
        await sftpWriteFile(sftp)(remoteEntryPath, entryScript);

        const client = getAdapterClient(clusterId);
        const reply = await asyncClientCall(client.job, "submitJob", {
          userId,
          jobName: trainJobName,
          algorithm: algorithmVersion?.path,
          image: image!.path,
          dataset: datasetVersion?.path,
          model: modelVersion?.path,
          mountPoint,
          account,
          partition: partition!,
          coreCount,
          nodeCount,
          gpuCount: gpuCount ?? 0,
          memoryMb: Number(memory),
          timeLimitMinutes: maxTime,
          workingDirectory: trainJobsDirectory,
          script: remoteEntryPath,
          // 约定第一个参数确定是创建应用or训练任务，第二个参数为创建应用时的appId
          extraOptions: [JobType.TRAIN],
        }).catch((e) => {
          const ex = e as ServiceError;
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Submit train job failed, ${ex.message}`,
            cause: ex.details,
          });
        });

        const metadata: SessionMetadata = {
          jobId: reply.jobId,
          sessionId: trainJobName,
          submitTime: new Date().toISOString(),
          image: {
            name: image!.name,
            tag: image!.tag,
          },
          jobType: JobType.TRAIN,
        };
        await sftpWriteFile(sftp)(join(trainJobsDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));
        return { jobId: reply.jobId };

      });

    },
  );

// GET /appSessions
export const listAppSessions =
  procedure
    .input(z.object({ clusterId: z.string(), isRunning: z.boolean(), ...paginationSchema.shape }))
    .output(z.object({ sessions: z.array(AppSessionSchema) }))
    .query(async ({ input, ctx: { user } }) => {

      const { clusterId, isRunning, page, pageSize } = input;

      const userId = user.identityId;

      const host = getClusterLoginNode(clusterId);

      if (!host) {
        throw clusterNotFound(clusterId);
      }

      const apps = getClusterAppConfigs(clusterId);

      return await sshConnect(host, userId, logger, async (ssh) => {

        // If a job is not running, it cannot be ready
        const client = getAdapterClient(clusterId);
        const runningJobsInfo = await asyncClientCall(client.job, "getJobs", {
          fields: ["job_id", "state", "elapsed_seconds", "time_limit_minutes", "reason"],
          filter: {
            users: [userId], accounts: [],
            states: ["RUNNING", "PENDING"],
          },
        }).then((resp) => resp.jobs);

        const runningJobInfoMap = runningJobsInfo.reduce((prev, curr) => {
          prev[curr.jobId] = curr;
          return prev;
        }, {} as Record<number, JobInfo>);

        const homeDir = await getUserHomedir(ssh, userId, logger);
        const appJobsDirectory = join(homeDir, aiConfig.appJobsDir);
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, appJobsDirectory)) { return { sessions: []}; }
        const list = await sftpReaddir(sftp)(appJobsDirectory);
        const sessions = [] as AppSession[];

        await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(appJobsDirectory, filename);
          const metadataPath = join(jobDir, SESSION_METADATA_NAME);

          if (!await sftpExists(sftp, metadataPath)) {
            return;
          }

          const content = await sftpReadFile(sftp)(metadataPath);
          const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;


          const runningJobInfo: JobInfo | undefined = runningJobInfoMap[sessionMetadata.jobId];

          let host: string | undefined = undefined;
          let port: number | undefined = undefined;

          // 如果是训练，不需要连接信息
          if (sessionMetadata.jobType === JobType.APP && sessionMetadata.appId) {

            const app = checkAppExist(apps, sessionMetadata.appId);

            // judge whether the app is ready
            if (runningJobInfo && runningJobInfo.state === "RUNNING") {
            // 对于k8s这种通过容器运行作业的集群，当把容器中的作业工作目录挂载到宿主机中时，目录中新生成的文件不会马上反映到宿主机中，
            // 具体体现为sftpExists无法找到新生成的SERVER_SESSION_INFO和VNC_SESSION_INFO文件，必须实际读取一次目录，才能识别到它们
              await sftpReaddir(sftp)(jobDir);

              if (app.type === "web") {
                // for server apps,
                // try to read the SESSION_INFO file to get port and password
                const infoFilePath = join(jobDir, SERVER_SESSION_INFO);
                if (await sftpExists(sftp, infoFilePath)) {
                  const content = await sftpReadFile(sftp)(infoFilePath);
                  const serverSessionInfo = JSON.parse(content.toString()) as ServerSessionInfoData;

                  host = serverSessionInfo.HOST;
                  port = serverSessionInfo.PORT;
                }
              } else {
              // TODO: if vnc apps
              }

              const connectionInfo = await getAppConnectionInfoFromAdapter(clusterId, sessionMetadata.jobId, logger);
              if (connectionInfo?.response?.$case === "appConnectionInfo") {
                host = connectionInfo.response.appConnectionInfo.host;
                port = connectionInfo.response.appConnectionInfo.port;
              }
            }
          }

          const terminatedStates = ["BOOT_FAIL", "COMPLETED", "DEADLINE", "FAILED",
            "NODE_FAIL", "PREEMPTED", "SPECIAL_EXIT", "TIMEOUT"];
          const isPendingOrTerminated = runningJobInfo?.state === "PENDING"
            || terminatedStates.includes(runningJobInfo?.state);

          sessions.push({
            jobId: sessionMetadata.jobId,
            appId: sessionMetadata.appId,
            appName: sessionMetadata?.appId ? apps[sessionMetadata?.appId]?.name : undefined,
            sessionId: sessionMetadata.sessionId,
            submitTime: sessionMetadata.submitTime,
            jobType: sessionMetadata.jobType,
            image: sessionMetadata.image,
            state: runningJobInfo?.state ?? "ENDED",
            dataPath: await sftpRealPath(sftp)(jobDir),
            runningTime: runningJobInfo?.elapsedSeconds !== undefined
              ? formatTime(runningJobInfo.elapsedSeconds * 1000) : "",
            timeLimit: runningJobInfo?.timeLimitMinutes ? formatTime(runningJobInfo.timeLimitMinutes * 60 * 1000) : "",
            reason: isPendingOrTerminated ? (runningJobInfo?.reason ?? "") : undefined,
            host,
            port,
          });

        }));
        const runningStates = ["RUNNING", "PENDING"];

        const filteredSessions = sessions.filter((session) => isRunning
          ? runningStates.includes(session.state)
          : !runningStates.includes(session.state))
          .sort((a, b) => b.submitTime.localeCompare(a.submitTime)); ;

        const { paginatedItems: paginatedSessions, totalCount } = paginate(
          filteredSessions, page, pageSize,
        );

        return { sessions: paginatedSessions, count: totalCount };
      });
    });


const TIMEOUT_MS = 3000;

// 不要直接让用户检查某个host和port，可能会泄露信息
// 用户关心的只是一个appSessions能不能连上，所以就只让用户提供sessionId，服务器去自己取获取host和port
// GET /appSessions/{sessionId}/checkConnectivity
export const checkAppConnectivity =
procedure.input(z.object({
  host: z.string(),
  port: z.number(),
})).output(z.object({
  ok: z.boolean(),
})).query(
  async ({ input }) => {

    const { port, host } = input;

    const reachable = await isPortReachable(port, host, TIMEOUT_MS);

    return { ok: reachable };
  },

);


const AppConnectPropsSchema = z.object({
  method: z.string(),
  path: z.string(),
  query: z.record(z.string()).optional(),
  formData: z.record(z.string()).optional(),
});

const ConnectToAppResponseSchema = z.intersection(
  z.object({
    host: z.string(),
    port: z.number(),
    password: z.string(),
  }),
  z.union([
    z.object({
      type: z.literal("web"),
      connect: AppConnectPropsSchema,
      proxyType: z.union([
        z.literal("relative"),
        z.literal("absolute"),
      ]),
      customFormData: z.record(z.string()).optional(),
    }),
    z.object({ type: z.literal("vnc") }),
  ]),
);

// POST /appSessions/{sessionId}/connect
export const connectToApp =
procedure
  .input(z.object({
    cluster: z.string(),
    sessionId: z.string(),
  }))
  .output(ConnectToAppResponseSchema)
  .mutation(async ({ input, ctx: { user } }) => {

    const { cluster, sessionId } = input;
    const userId = user.identityId;

    const host = getClusterLoginNode(cluster);
    if (!host) {
      throw clusterNotFound(cluster);
    }

    const apps = getClusterAppConfigs(cluster);

    const reply = await sshConnect(host, "root", logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      const userHomeDir = await getUserHomedir(ssh, userId, logger);
      const jobDir = join(userHomeDir, aiConfig.appJobsDir, sessionId);

      if (!await sftpExists(sftp, jobDir)) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `session id ${sessionId} is not found`,
        });
      }

      const metadataPath = join(jobDir, SESSION_METADATA_NAME);
      const content = await sftpReadFile(sftp)(metadataPath);
      const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

      if (sessionMetadata.jobType === JobType.APP && sessionMetadata.appId) {
        const connectionInfo = await getAppConnectionInfoFromAdapter(cluster, sessionMetadata.jobId, logger);
        if (connectionInfo?.response?.$case === "appConnectionInfo") {
          const { host, port, password } = connectionInfo.response.appConnectionInfo;
          return {
            appId: sessionMetadata.appId,
            host: host,
            port: port,
            password: password,
          };
        }
      }
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `session id ${sessionId} cannot be connected.`,
      });

    });

    const app = apps[reply.appId];

    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${reply.appId} is not found`,
      });
    }

    switch (app.type) {
    case AppType.web:
      return {
        host: reply.host,
        port: reply.port,
        password: reply.password,
        type: "web",
        connect : {
          method:app.web!.connect.method,
          query: app.web!.connect.query ?? {},
          formData: app.web!.connect.formData ?? {},
          path: app.web!.connect.path,
        },
        proxyType: app.web!.proxyType === "absolute"
          ? "absolute"
          : "relative",
      };
    default:
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `Unknown app type ${app.type} of app id ${reply.appId}`,
      });
    }

  });


// DELETE /jobs/{jobId}
export const cancelJob =
procedure.input(z.object({
  cluster: z.string(),
  jobId: z.number(),
})).mutation(async ({ input, ctx: { user } }) => {

  const { cluster, jobId } = input;

  const userId = user.identityId;
  const client = getAdapterClient(cluster);
  await asyncClientCall(client.job, "cancelJob", {
    userId,
    jobId,
  });
  return {};
});
