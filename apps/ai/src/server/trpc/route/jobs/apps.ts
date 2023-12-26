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
import { getPlaceholderKeys } from "@scow/lib-config/build/parse";
import { getUserHomedir, sftpWriteFile } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { join } from "path";
import { quote } from "shell-quote";
import { aiConfig } from "src/server/config/ai";
import { AlgorithmVersion } from "src/server/entities/AlgorithmVersion";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { procedure } from "src/server/trpc/procedure/base";
import { generateRandomPassword, getClusterAppConfigs, sha1WithSalt } from "src/server/utils/app";
import { getAdapterClient } from "src/server/utils/clusters";
import { getORM } from "src/server/utils/getOrm";
import { logger } from "src/server/utils/logger";
import { getClusterLoginNode, sshConnect } from "src/server/utils/ssh";
import { publicConfig } from "src/utils/config";
import { BASE_PATH } from "src/utils/processEnv";
import { z } from "zod";

export enum JobType {
  APP = "app",
  TRAIN = "train",
}

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
  image: string;
}

const SESSION_METADATA_NAME = "session.json";

const SERVER_SESSION_INFO = "server_session_info.json";

const getEnvVariables = (env: Record<string, string>) =>
  Object.keys(env).map((x) => `export ${x}=${quote([env[x] ?? ""])}\n`).join("");


const getEntryScript = (appId: string, runtimeVariables: string, sessionInfo: string, workingDirectory?: string) => {
  if (appId === "jupter") {
    const inputVariables = "export PORT=$1\nexport HOST=$2\nexport SVCPORT=$3\n";

    const baseUrl = "${PROXY_BASE_PATH}/${HOST}/${SVCPORT}/";
    const rootDir = workingDirectory;

    // 生成随机密码
    const password = generateRandomPassword(12);

    const passwordVariable = `export PASSWORD=${password}\n`;
    // 定义盐值
    const salt = "123";
    // 获取哈希值
    const passwordSha1 = sha1WithSalt(password, salt);
    const hashedPassword = `sha1:${salt}:${passwordSha1}`;
    const script = `start-notebook.py --ServerApp.ip='0.0.0.0' --ServerApp.port=\${PORT} \
--ServerApp.port_retries=0 --PasswordIdentityProvider.hashed_password='${hashedPassword}' \
--ServerApp.open_browser=False --ServerApp.base_url='${baseUrl}' --ServerApp.allow_origin='*' \
--ServerApp.disable_check_xsrf=True --ServerApp.root_dir='${rootDir}'`;

    return "#!/bin/bash\n" + passwordVariable + runtimeVariables + sessionInfo + inputVariables + script;
  }
  throw new Error(`App ${appId} is not supported`);
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

    const comment = app.appComment ?? "";

    return { appName: app.name, appImage: app.image, appComment: comment };
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
    workingDirectory: z.string(),
  })).mutation(async ({ input, ctx: { user } }) => {
    const { clusterId, appId, appJobName, algorithm, image,
      dataset, account, partition, qos, coreCount, nodeCount, gpuCount, memory,
      maxTime, workingDirectory } = input;
    const apps = getClusterAppConfigs(clusterId);
    const app = apps[appId];

    const proxyBasePath = join(BASE_PATH, "/api/proxy", clusterId);
    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${appId} is not found`,
      });
    }

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

      if (app.type === "web") {
        const runtimeVariables = getEnvVariables({
          PROXY_BASE_PATH: join(proxyBasePath, app.web!.proxyType),
          SERVER_SESSION_INFO,
        });
        let customForm = String.raw`\"HOST\":\"$HOST\",\"PORT\":$PORT`;
        for (const key in app.web!.connect.formData) {
          const texts = getPlaceholderKeys(app.web!.connect.formData[key]);
          for (const i in texts) {
            customForm += `,\\\"${texts[i]}\\\":\\\"$${texts[i]}\\\"`;
          }
        }
        const sessionInfo = `echo -e "{${customForm}}" >$SERVER_SESSION_INFO\n`;

        const entryScript = getEntryScript(appId, runtimeVariables, sessionInfo, join(homeDir, workingDirectory));

        await sftpWriteFile(sftp)(remoteEntryPath, entryScript);

        const client = getAdapterClient(clusterId);
        const reply = await asyncClientCall(client.job, "submitJob", {
          userId,
          jobName: appJobName,
          // algorithm: algorithmVersion.path,
          // image,
          // dataset: datasetVesion.path,
          account,
          partition: partition!,
          qos,
          coreCount,
          nodeCount,
          gpuCount: gpuCount ?? 0,
          memoryMb,
          timeLimitMinutes: maxTime,
          workingDirectory: appJobsDirectory,
          script: remoteEntryPath,
          // 约定第一个参数确定是创建应用or训练任务，第二个参数为创建应用时的appId
          extraOptions: [JobType.APP, appId],
        }).catch((e) => {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "submit job failed",
          });
        });

        const metadata: SessionMetadata = {
          jobId: reply.jobId,
          sessionId: appJobName,
          submitTime: new Date().toISOString(),
          appId,
          image: image,
        };
        await sftpWriteFile(sftp)(join(appJobsDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));
      }
    });

  });
