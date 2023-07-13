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
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getPlaceholderKeys } from "@scow/lib-config/build/parse";
import { formatTime } from "@scow/lib-scheduler-adapter";
import { getUserHomedir,
  sftpChmod, sftpExists, sftpReaddir, sftpReadFile, sftpRealPath, sftpWriteFile } from "@scow/lib-ssh";
import { parseErrorDetails } from "@scow/rich-error-model";
import { JobInfo, SubmitJobRequest } from "@scow/scheduler-adapter-protos/build/protos/job";
import fs from "fs";
import { join } from "path";
import { quote } from "shell-quote";
import { AppOps, AppSession, SubmissionInfo } from "src/clusterops/api/app";
import { clusters } from "src/config/clusters";
import { portalConfig } from "src/config/portal";
import { getClusterAppConfigs, splitSbatchArgs } from "src/utils/app";
import { getAdapterClient } from "src/utils/clusters";
import { getIpFromProxyGateway } from "src/utils/proxy";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { displayIdToPort, getVNCCMDPath, parseDisplayId,
  refreshPassword, refreshPasswordByProxyGateway } from "src/utils/turbovnc";

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
}

// All keys are strings except PORT
interface ServerSessionInfoData {
  [key: string]: string | number;
  HOST: string;
  PORT: number;
  PASSWORD: string;
}

const SERVER_ENTRY_COMMAND = fs.readFileSync("assets/slurm/server_entry.sh", { encoding: "utf-8" });
const VNC_ENTRY_COMMAND = fs.readFileSync("assets/slurm/vnc_entry.sh", { encoding: "utf-8" });

const VNC_OUTPUT_FILE = "output";

const SESSION_METADATA_NAME = "session.json";

const SERVER_SESSION_INFO = "server_session_info.json";
const VNC_SESSION_INFO = "VNC_SESSION_INFO";

const APP_LAST_SUBMISSION_INFO = "last_submission.json";
const BIN_BASH_SCRIPT_HEADER = "#!/bin/bash -l\n";

export const appOps = (cluster: string): AppOps => {

  const host = getClusterLoginNode(cluster);

  if (!host) { throw new Error(`Cluster ${cluster} has no login node`); }

  return {
    createApp: async (request, logger) => {
      const apps = getClusterAppConfigs(cluster);

      const { appId, userId, account, coreCount, nodeCount, gpuCount, memory, maxTime, proxyBasePath,
        partition, qos, customAttributes, appJobName } = request;

      const memoryMb = memory ? Number(memory.slice(0, -2)) : undefined;


      const userSbatchOptions = customAttributes["sbatchOptions"]
        ? splitSbatchArgs(customAttributes["sbatchOptions"])
        : [];

      // prepare script file
      const appConfig = apps[appId];

      if (!appConfig) {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }

      const jobName = appJobName;

      const workingDirectory = join(portalConfig.appJobsDir, jobName);

      const lastSubmissionDirectory = join(portalConfig.appLastSubmissionDir, appId);

      return await sshConnect(host, userId, logger, async (ssh) => {

        // make sure workingDirectory exists.
        await ssh.mkdir(workingDirectory);
        // make sure lastSubmissionDirectory exists.
        await ssh.mkdir(lastSubmissionDirectory);

        const sftp = await ssh.requestSFTP();

        const getEnvVariables = (env: Record<string, string>) =>
          Object.keys(env).map((x) => `export ${x}=${quote([env[x] ?? ""])}\n`).join("");

        const submitAndWriteMetadata = async (request: SubmitJobRequest) => {
          const remoteEntryPath = join(workingDirectory, "entry.sh");

          // submit entry.sh
          const client = getAdapterClient(cluster);
          const reply = await asyncClientCall(client.job, "submitJob", request).catch((e) => {
            const ex = e as ServiceError;
            const errors = parseErrorDetails(ex.metadata);
            if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "SBATCH_FAILED") {
              throw <ServiceError> {
                code: Status.INTERNAL,
                message: "sbatch failed",
                details: e.details,
              };
            }
            else {
              throw e;
            }
          });

          const jobId = reply.jobId;

          // write session metadata
          const metadata: SessionMetadata = {
            jobId,
            sessionId: jobName,
            submitTime: new Date().toISOString(),
            appId,
          };

          // entry.sh save the generated script
          await sftpWriteFile(sftp)(remoteEntryPath, reply.generatedScript);

          await sftpWriteFile(sftp)(join(workingDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));

          // write a last_submission session
          const lastSubmissionInfo: SubmissionInfo = {
            userId,
            cluster,
            appId,
            appName: apps[appId].name,
            account: request.account,
            partition: request.partition,
            qos: request.qos,
            nodeCount: request.nodeCount,
            coreCount: request.coreCount,
            maxTime: request.timeLimitMinutes!,
            gpuCount: request.gpuCount,
            submitTime: new Date().toISOString(),
            customAttributes: customAttributes,
          };

          await sftpWriteFile(sftp)(join(lastSubmissionDirectory, APP_LAST_SUBMISSION_INFO),
            JSON.stringify(lastSubmissionInfo));

          return { jobId, sessionId: metadata.sessionId } as const;
        };

        let customAttributesExport: string = "";
        for (const key in customAttributes) {
          const quotedAttribute = quote([customAttributes[key] ?? ""]);
          const envItem = `export ${key}=${quotedAttribute}`;
          customAttributesExport = customAttributesExport + envItem + "\n";
        }

        if (appConfig.type === "web") {
          let customForm = String.raw`\"HOST\":\"$HOST\",\"PORT\":$PORT`;
          for (const key in appConfig.web!.connect.formData) {
            const texts = getPlaceholderKeys(appConfig.web!.connect.formData[key]);
            for (const i in texts) {
              customForm += `,\\\"${texts[i]}\\\":\\\"$${texts[i]}\\\"`;
            }
          }
          const sessionInfo = `echo -e "{${customForm}}" >$SERVER_SESSION_INFO`;

          const runtimeVariables = `export PROXY_BASE_PATH=${quote([join(proxyBasePath, appConfig.web!.proxyType)])}\n`;

          const beforeScript = runtimeVariables + customAttributesExport + appConfig.web!.beforeScript + sessionInfo;
          await sftpWriteFile(sftp)(join(workingDirectory, "before.sh"), beforeScript);

          const webScript = BIN_BASH_SCRIPT_HEADER + appConfig.web!.script;
          const scriptPath = join(workingDirectory, "script.sh");
          await sftpWriteFile(sftp)(scriptPath, webScript);
          await sftpChmod(sftp)(scriptPath, "755");

          const configSlurmOptions: string[] = appConfig.slurm?.options ?? [];

          const extraOptions = configSlurmOptions.concat(userSbatchOptions);

          const envVariables = getEnvVariables({ SERVER_SESSION_INFO });

          return await submitAndWriteMetadata({
            userId, jobName, account, partition: partition!, qos, nodeCount, gpuCount: gpuCount ?? 0, memoryMb,
            coreCount, timeLimitMinutes: maxTime, script: envVariables + SERVER_ENTRY_COMMAND,
            workingDirectory, extraOptions,
          });
        } else {
          // vnc app
          const beforeScript = customAttributesExport + (appConfig.vnc!.beforeScript ?? "");
          await sftpWriteFile(sftp)(join(workingDirectory, "before.sh"), beforeScript);

          const xstartupPath = join(workingDirectory, "xstartup");
          const xstartupScript = BIN_BASH_SCRIPT_HEADER + appConfig.vnc!.xstartup;
          await sftpWriteFile(sftp)(xstartupPath, xstartupScript);
          await sftpChmod(sftp)(xstartupPath, "755");

          const configSlurmOptions: string[] = appConfig.slurm?.options ?? [];

          const extraOptions = configSlurmOptions.concat(userSbatchOptions);

          const vncserverBinPath = getVNCCMDPath(cluster, "vncserver");

          const envVariables = getEnvVariables({ VNC_SESSION_INFO, VNCSERVER_BIN_PATH: vncserverBinPath });

          return await submitAndWriteMetadata({
            userId, jobName, account, partition: partition!, qos, nodeCount, gpuCount: gpuCount ?? 0, memoryMb,
            coreCount, timeLimitMinutes: maxTime, script: envVariables + VNC_ENTRY_COMMAND,
            workingDirectory, stdout: VNC_OUTPUT_FILE, extraOptions,
          });

        }

      });
    },

    getAppLastSubmission: async (requset, logger) => {
      const { userId, appId } = requset;

      return await sshConnect(host, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();
        const file = join(portalConfig.appLastSubmissionDir, appId, APP_LAST_SUBMISSION_INFO);

        if (!await sftpExists(sftp, file)) { return { lastSubmissionInfo: undefined }; }
        const content = await sftpReadFile(sftp)(file);
        const data = JSON.parse(content.toString()) as SubmissionInfo;

        return { lastSubmissionInfo: data };
      });
    },

    listAppSessions: async (request, logger) => {

      const apps = getClusterAppConfigs(cluster);

      const { userId } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {

        // If a job is not running, it cannot be ready
        const client = getAdapterClient(cluster);
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

        const sftp = await ssh.requestSFTP();

        const userHomeDir = await getUserHomedir(ssh, userId, logger);
        const userAppJobDir = join(userHomeDir, portalConfig.appJobsDir);

        if (!await sftpExists(sftp, userAppJobDir)) { return { sessions: []}; }

        // get all job directories
        const list = await sftpReaddir(sftp)(userAppJobDir);

        const sessions = [] as AppSession[];

        await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(userAppJobDir, filename);
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
            // for vnc apps,
            // try to find the output file and try to parse the display number
              const vncSessionInfoPath = join(jobDir, VNC_SESSION_INFO);
              if (await sftpExists(sftp, vncSessionInfoPath)) {
                host = (await sftpReadFile(sftp)(vncSessionInfoPath)).toString().trim();

                const outputFilePath = join(jobDir, VNC_OUTPUT_FILE);
                if (await sftpExists(sftp, outputFilePath)) {
                  const content = (await sftpReadFile(sftp)(outputFilePath)).toString();
                  try {
                    const displayId = parseDisplayId(content);
                    port = displayIdToPort(displayId!);
                  } catch {
                  // ignored if displayId cannot be parsed
                  }
                }
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
            appName: apps[sessionMetadata.appId]?.name,
            sessionId: sessionMetadata.sessionId,
            submitTime: new Date(sessionMetadata.submitTime),
            state: runningJobInfo?.state ?? "ENDED",
            dataPath: await sftpRealPath(sftp)(jobDir),
            runningTime: runningJobInfo?.elapsedSeconds ? formatTime(runningJobInfo.elapsedSeconds * 1000) : "",
            timeLimit: runningJobInfo?.timeLimitMinutes ? formatTime(runningJobInfo.timeLimitMinutes * 60 * 1000) : "",
            reason: isPendingOrTerminated ? (runningJobInfo?.reason ?? "") : undefined,
            host,
            port,
          });

        }));

        return { sessions };
      });
    },

    connectToApp: async (request, logger) => {
      const apps = getClusterAppConfigs(cluster);

      const { sessionId, userId } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const userHomeDir = await getUserHomedir(ssh, userId, logger);
        const jobDir = join(userHomeDir, portalConfig.appJobsDir, sessionId);

        if (!await sftpExists(sftp, jobDir)) {
          throw <ServiceError>{ code: Status.NOT_FOUND, message: `session id ${sessionId} is not found` };
        }

        const metadataPath = join(jobDir, SESSION_METADATA_NAME);
        const content = await sftpReadFile(sftp)(metadataPath);
        const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

        const app = apps[sessionMetadata.appId];

        if (app.type === "web") {
          const infoFilePath = join(jobDir, SERVER_SESSION_INFO);
          if (await sftpExists(sftp, infoFilePath)) {
            const content = await sftpReadFile(sftp)(infoFilePath);
            const serverSessionInfo = JSON.parse(content.toString()) as ServerSessionInfoData;

            const { HOST, PORT, PASSWORD, ...rest } = serverSessionInfo;
            const customFormData = rest as {[key: string]: string};
            const ip = await getIpFromProxyGateway(cluster, HOST, logger);
            return {
              appId: sessionMetadata.appId,
              host: ip || HOST,
              port: +PORT,
              password: PASSWORD,
              customFormData:  customFormData ?? {},
            };
          }
        } else {
          // for vnc apps,
          // try to find the output file and try to parse the display number
          const vncSessionInfoPath = join(jobDir, VNC_SESSION_INFO);

          // try to read the host info
          if (await sftpExists(sftp, vncSessionInfoPath)) {

            const host = (await sftpReadFile(sftp)(vncSessionInfoPath)).toString().trim();

            const outputFilePath = join(jobDir, VNC_OUTPUT_FILE);
            if (await sftpExists(sftp, outputFilePath)) {

              const content = (await sftpReadFile(sftp)(outputFilePath)).toString();

              let displayId: number | undefined = undefined;
              try {
                displayId = parseDisplayId(content);
              } catch {
                // ignored if displayId cannot be parsed
              }

              if (displayId) {
                // the server is run at the compute node

                // if proxyGateway configured, connect to compute node by proxyGateway and get ip of compute node
                const proxyGatewayConfig = clusters?.[cluster]?.proxyGateway;
                if (proxyGatewayConfig) {
                  const url = new URL(proxyGatewayConfig.url);
                  return await sshConnect(url.hostname, "root", logger, async (proxyGatewaySsh) => {
                    logger.info(`Connecting to compute node ${host} via proxy gateway ${url.hostname}`);
                    const { password, ip } =
                      await refreshPasswordByProxyGateway(proxyGatewaySsh, cluster, host, userId, logger, displayId!);
                    return {
                      code: "OK",
                      appId: sessionMetadata.appId,
                      host: ip || host,
                      port: displayIdToPort(displayId!),
                      password,
                    };
                  });
                }

                // login to the compute node and refresh the password
                // connect as user so that
                // the service node doesn't need to be able to connect to compute nodes with public key
                return await sshConnect(host, userId, logger, async (computeNodeSsh) => {
                  const password = await refreshPassword(computeNodeSsh, cluster, null, logger, displayId!);
                  return {
                    appId: sessionMetadata.appId,
                    host,
                    port: displayIdToPort(displayId!),
                    password,
                  };
                });
              }
            }
          }
        }

        throw <ServiceError>{ code: Status.UNAVAILABLE, message: `session id ${sessionId} cannot be connected` };

      });
    },
  };
};

