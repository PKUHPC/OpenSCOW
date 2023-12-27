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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getPlaceholderKeys } from "@scow/lib-config/build/parse";
import { formatTime } from "@scow/lib-scheduler-adapter";
import { getUserHomedir, sftpExists, sftpReaddir, sftpReadFile, sftpRealPath, sftpWriteFile } from "@scow/lib-ssh";
import { DetailedError } from "@scow/rich-error-model";
import { JobInfo } from "@scow/scheduler-adapter-protos/build/protos/job";
import { ApiVersion } from "@scow/utils/build/version";
import { TRPCError } from "@trpc/server";
import fs from "fs";
import { join } from "path";
import { Logger } from "pino";
import { quote } from "shell-quote";
import { aiConfig } from "src/server/config/ai";
import { AlgorithmVersion } from "src/server/entities/AlgorithmVersion";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { generateRandomPassword, getClusterAppConfigs, sha1WithSalt } from "src/server/utils/app";
import { checkSchedulerApiVersion, getAdapterClient } from "src/server/utils/clusters";
import { getORM } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { BASE_PATH } from "src/utils/processEnv";
import { z } from "zod";


export enum JobType {
  APP = "app",
  TRAIN = "train",
}

export interface AppSession {
  sessionId: string;
  jobId: number;
  submitTime: string;
  jobType: JobType;
  appId: string;
  appName: string | undefined;
  state: string;
  dataPath: string;
  runningTime: string;
  timeLimit: string;
  reason?: string;
  host: string | undefined;
  port: number | undefined;
}

// All keys are strings except PORT
interface ServerSessionInfoData {
  [key: string]: string | number;
  HOST: string;
  PORT: number;
  PASSWORD: string;
}

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
  image: string;
  jobType: JobType
}

const SERVER_ENTRY_COMMAND = fs.readFileSync("assets/slurm/server_entry.sh", { encoding: "utf-8" });

const SESSION_METADATA_NAME = "session.json";

const SERVER_SESSION_INFO = "server_session_info.json";

const getEnvVariables = (env: Record<string, string>) =>
  Object.keys(env).map((x) => `export ${x}=${quote([env[x] ?? ""])}\n`).join("");


// const errorInfo = (reason: string) =>
//   ErrorInfo.create({ domain: "", reason: reason, metadata: {} });

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
      path: "/jobs/listAvailableApps",
      tags: ["jobs"],
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
    const app = apps[appId];
    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${appId} is not found`,
      });
    }

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
  .input(z.object({
    clusterId: z.string(),
    appId: z.string(),
    appJobName: z.string(),
    algorithm: z.number(),
    image: z.string(),
    dataset: z.number().optional(),
    account: z.string(),
    partition: z.string().optional(),
    qos: z.string().optional(),
    coreCount: z.number(),
    nodeCount: z.number(),
    gpuCount: z.number().optional(),
    memory: z.string().optional(),
    maxTime: z.number(),
    customAttributes: z.record(z.string(), z.union([z.number(), z.string(), z.undefined()])),
  })).mutation(async ({ input, ctx: { user } }) => {
    const { clusterId, appId, appJobName, algorithm, image,
      dataset, account, partition, qos, coreCount, nodeCount, gpuCount, memory,
      maxTime, customAttributes } = input;
    const apps = getClusterAppConfigs(clusterId);
    const app = apps[appId];

    const proxyBasePath = join(BASE_PATH, "/api/proxy", clusterId);
    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${appId} is not found`,
      });
    }
    const attributesConfig = app.attributes;
    attributesConfig?.forEach((attribute) => {
      if (attribute.required && !(attribute.name in customAttributes) && attribute.name !== "sbatchOptions") {
        // throw new DetailedError({
        //   code: Status.INVALID_ARGUMENT,
        //   message: `custom form attribute ${attribute.name} is required but not found`,
        //   details: [errorInfo("INVALID ARGUMENT")],
        // });
      }

      switch (attribute.type) {
      case "number":
        if (customAttributes[attribute.name] && Number.isNaN(Number(customAttributes[attribute.name]))) {
          // throw new DetailedError({
          //   code: Status.INVALID_ARGUMENT,
          //   message: `
          //     custom form attribute ${attribute.name} should be of type number,
          //     but of type ${typeof customAttributes[attribute.name]}`,
          //   details: [errorInfo("INVALID ARGUMENT")],
          // });
        }
        break;

      case "text":
        break;

      case "select":
        // check the option selected by user is in select attributes as the config defined
        if (customAttributes[attribute.name]
          && !(attribute.select!.some((optionItem) => optionItem.value === customAttributes[attribute.name]))) {
          // throw new DetailedError({
          //   code: Status.INVALID_ARGUMENT,
          //   message: `
          //     the option value of ${attribute.name} selected by user should be
          //     one of select attributes as the ${appId} config defined,
          //     but is ${customAttributes[attribute.name]}`,
          //   details: [errorInfo("INVALID ARGUMENT")],
          // });
        }
        break;

      default:
        throw new Error(`
        the custom form attributes type in ${appId} config should be one of number, text or select,
        but the type of ${attribute.name} is ${attribute.type}`);
      }
    });

    const orm = await getORM();

    const algorithmVersion = await orm.em.findOne(AlgorithmVersion, { id: algorithm });

    if (!algorithmVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `algorithm version id ${algorithm} is not found`,
      });
    }

    const datasetVesion = await orm.em.findOne(DatasetVersion, { id: dataset });

    if (!datasetVesion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `dataset version id ${dataset} is not found`,
      });
    }

    const memoryMb = memory ? Number(memory.slice(0, -2)) : undefined;

    const host = getClusterLoginNode(clusterId);

    if (!host) { throw new Error(`Cluster ${clusterId} has no login node`); }
    const userId = user!.identityId;
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
        await sftpWriteFile(sftp)(remoteEntryPath, entryScript);

        // const client = getAdapterClient(clusterId);
        // const reply = await asyncClientCall(client.job, "submitJob", {
        //   userId,
        //   jobName: appJobName,
        //   // algorithm: algorithmVersion.path,
        //   // image,
        //   // dataset: datasetVesion.path,
        //   account,
        //   partition: partition!,
        //   qos,
        //   coreCount,
        //   nodeCount,
        //   gpuCount: gpuCount ?? 0,
        //   memoryMb,
        //   timeLimitMinutes: maxTime,
        //   workingDirectory: appJobsDirectory,
        //   script: remoteEntryPath,
        //   // 约定第一个参数确定是创建应用or训练任务，第二个参数为创建应用时的appId
        //   extraOptions: [JobType.APP, appId],
        // }).catch((e) => {
        //   throw new TRPCError({
        //     code: "INTERNAL_SERVER_ERROR",
        //     message: "submit job failed",
        //   });
        // });

        const metadata: SessionMetadata = {
          // jobId: reply.jobId,
          jobId: 123,
          sessionId: appJobName,
          submitTime: new Date().toISOString(),
          appId,
          image: image,
          jobType: JobType.APP,
        };
        await sftpWriteFile(sftp)(join(appJobsDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));
      }
    });

  });

export const listAppSessions =
  procedure
    .input(z.object({ clusterId: z.string(), isRunning: z.boolean() }))
    .output(z.object({ sessions: z.array(z.object({
      sessionId: z.string(),
      appId: z.string(),
      submitTime: z.string(),
      jobId: z.number(),
    })) }))
    .query(async ({ input, ctx: { user } }) => {
      const { clusterId, isRunning } = input;
      const userId = user.identityId;
      const host = getClusterLoginNode(clusterId);

      if (!host) { throw new Error(`Cluster ${clusterId} has no login node`); }

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

          const app = apps[sessionMetadata.appId];

          let host: string | undefined = undefined;
          let port: number | undefined = undefined;

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

          const terminatedStates = ["BOOT_FAIL", "COMPLETED", "DEADLINE", "FAILED",
            "NODE_FAIL", "PREEMPTED", "SPECIAL_EXIT", "TIMEOUT"];
          const isPendingOrTerminated = runningJobInfo?.state === "PENDING"
            || terminatedStates.includes(runningJobInfo?.state);

          sessions.push({
            jobId: sessionMetadata.jobId,
            appId: sessionMetadata.appId,
            appName: apps[sessionMetadata.appId]?.name,
            sessionId: sessionMetadata.sessionId,
            submitTime: sessionMetadata.submitTime,
            jobType: sessionMetadata.jobType,
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

        return { sessions: sessions.filter((session) => isRunning
          ? runningStates.includes(session.state)
          : !runningStates.includes(session.state)) };
      });
    });
