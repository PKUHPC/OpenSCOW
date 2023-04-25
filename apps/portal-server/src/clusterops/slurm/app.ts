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

import { getPlaceholderKeys } from "@scow/lib-config/build/parse";
import { getUserHomedir,
  loggedExec, sftpChmod, sftpExists, sftpReaddir, sftpReadFile, sftpRealPath, sftpWriteFile } from "@scow/lib-ssh";
import { RunningJob } from "@scow/protos/build/common/job";
import { randomUUID } from "crypto";
import fs from "fs";
import { join } from "path";
import { quote } from "shell-quote";
import { AppOps, AppSession } from "src/clusterops/api/app";
import { displayIdToPort } from "src/clusterops/slurm/bl/port";
import { getAppConfigs } from "src/config/apps";
import { portalConfig } from "src/config/portal";
import { splitSbatchArgs } from "src/utils/app";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { parseDisplayId, refreshPassword, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

import { querySqueue } from "./bl/queryJobInfo";
import { generateJobScript, parseSbatchOutput } from "./bl/submitJob";

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

export const slurmAppOps = (cluster: string): AppOps => {

  const host = getClusterLoginNode(cluster);

  if (!host) { throw new Error(`Cluster ${cluster} has no login node`); }

  return {
    createApp: async (request, logger) => {
      const apps = getAppConfigs();

      const { appId, userId, account, coreCount, maxTime, proxyBasePath,
        partition, qos, customAttributes } = request;


      const userSbatchOptions = customAttributes["sbatchOptions"]
        ? splitSbatchArgs(customAttributes["sbatchOptions"])
        : [];

      // prepare script file
      const appConfig = apps[appId];

      if (!appConfig) { return { code: "APP_NOT_FOUND" }; }

      const jobName = randomUUID();

      const workingDirectory = join(portalConfig.appJobsDir, jobName);

      return await sshConnect(host, userId, logger, async (ssh) => {

        // make sure workingDirectory exists.
        await ssh.mkdir(workingDirectory);

        const sftp = await ssh.requestSFTP();

        const submitAndWriteMetadata = async (script: string, env?: Record<string, string>) => {
          const remoteEntryPath = join(workingDirectory, "entry.sh");

          await sftpWriteFile(sftp)(remoteEntryPath, script);

          // submit entry.sh
          // createApp is slow already
          // use executeAsUser increases code complexity greatly
          const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
            "sbatch", [remoteEntryPath], { execOptions: { env: env as NodeJS.ProcessEnv } },
          );

          if (code !== 0) {
            return { code: "SBATCH_FAILED", message: stderr } as const;
          }

          // parse stdout output to get the job id
          const jobId = parseSbatchOutput(stdout);

          // write session metadata
          const metadata: SessionMetadata = {
            jobId,
            sessionId: jobName,
            submitTime: new Date().toISOString(),
            appId,
          };

          await sftpWriteFile(sftp)(join(workingDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));
          return { code: "OK", jobId, sessionId: metadata.sessionId } as const;
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

          await sftpWriteFile(sftp)(join(workingDirectory, "script.sh"), appConfig.web!.script);

          const configSlurmOptions: string[] = appConfig.slurm?.options ?? [];

          const script = generateJobScript({
            jobName,
            command: SERVER_ENTRY_COMMAND,
            account: account,
            coreCount: coreCount,
            maxTime: maxTime,
            nodeCount: 1,
            partition: partition,
            workingDirectory,
            qos: qos,
            otherOptions: configSlurmOptions.concat(userSbatchOptions),
          });

          return await submitAndWriteMetadata(script, { SERVER_SESSION_INFO });
        } else {
          // vnc app
          const beforeScript = customAttributesExport + (appConfig.vnc!.beforeScript ?? "");
          await sftpWriteFile(sftp)(join(workingDirectory, "before.sh"), beforeScript);

          const xstartupPath = join(workingDirectory, "xstartup");
          await sftpWriteFile(sftp)(xstartupPath, appConfig.vnc!.xstartup);
          await sftpChmod(sftp)(xstartupPath, "755");

          const configSlurmOptions: string[] = appConfig.slurm?.options ?? [];

          const script = generateJobScript({
            jobName,
            command: VNC_ENTRY_COMMAND,
            account: account,
            coreCount: coreCount,
            maxTime: maxTime,
            nodeCount: 1,
            partition: partition,
            workingDirectory,
            qos: qos,
            output: VNC_OUTPUT_FILE,
            otherOptions: configSlurmOptions.concat(userSbatchOptions),
          });

          return await submitAndWriteMetadata(script, { VNC_SESSION_INFO, VNCSERVER_BIN_PATH });
        }

      });
    },

    listAppSessions: async (request, logger) => {
      const apps = getAppConfigs();

      const { userId } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {

        // If a job is not running, it cannot be ready
        const runningJobsInfo = await querySqueue(ssh, userId, logger, ["-u", userId]);

        const runningJobInfoMap = runningJobsInfo.reduce((prev, curr) => {
          prev[curr.jobId] = curr;
          return prev;
        }, {} as Record<number, RunningJob>);

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

          const runningJobInfo: RunningJob | undefined = runningJobInfoMap[sessionMetadata.jobId];

          const app = apps[sessionMetadata.appId];

          let ready = false;

          // judge whether the app is ready
          if (runningJobInfo && runningJobInfo.state === "RUNNING") {
            if (app.type === "web") {
            // for server apps,
            // try to read the SESSION_INFO file to get port and password
              const infoFilePath = join(jobDir, SERVER_SESSION_INFO);
              if (await sftpExists(sftp, infoFilePath)) {
                const content = await sftpReadFile(sftp)(infoFilePath);
                const serverSessionInfo = JSON.parse(content.toString()) as ServerSessionInfoData;
                const { HOST, PORT } = serverSessionInfo;

                const isPortReachable = await import("is-port-reachable");
                ready = await isPortReachable.default(PORT, { host: HOST });
                if (ready) {
                  logger.info(`${HOST}:${PORT} for web app ${app.name} is reachable.`);
                } else {
                  logger.info(`${HOST}:${PORT} for web app ${app.name} is not reachable.`);
                }
              }
            } else {
            // for vnc apps,
            // try to find the output file and try to parse the display number
              const vncSessionInfoPath = join(jobDir, VNC_SESSION_INFO);
              if (await sftpExists(sftp, vncSessionInfoPath)) {
                const host = (await sftpReadFile(sftp)(vncSessionInfoPath)).toString().trim();

                const outputFilePath = join(jobDir, VNC_OUTPUT_FILE);
                if (await sftpExists(sftp, outputFilePath)) {
                  const content = (await sftpReadFile(sftp)(outputFilePath)).toString();
                  try {
                    const isPortReachable = await import("is-port-reachable");
                    const displayId = parseDisplayId(content);
                    const port = displayIdToPort(displayId!);
                    ready = await isPortReachable.default(port, { host: host });
                    if (ready) {
                      logger.info(`${host}:{port} for vnc app ${app.name} is reachable.`);
                    } else {
                      logger.info(`${host}:{port} for vnc app ${app.name} is not reachable.`);
                    }
                  } catch {
                  // ignored if displayId cannot be parsed
                  }
                }
              }
            }
          }

          sessions.push({
            jobId: sessionMetadata.jobId,
            appId: sessionMetadata.appId,
            sessionId: sessionMetadata.sessionId,
            submitTime: new Date(sessionMetadata.submitTime),
            state: runningJobInfo?.state ?? "ENDED",
            ready,
            dataPath: await sftpRealPath(sftp)(jobDir),
            runningTime: runningJobInfo?.runningTime ?? "",
            timeLimit: runningJobInfo?.timeLimit ?? "",
          });

        }));

        return { sessions };
      });
    },

    connectToApp: async (request, logger) => {
      const apps = getAppConfigs();

      const { sessionId, userId } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const userHomeDir = await getUserHomedir(ssh, userId, logger);
        const jobDir = join(userHomeDir, portalConfig.appJobsDir, sessionId);

        if (!await sftpExists(sftp, jobDir)) {
          return { code: "NOT_FOUND" };
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
            return {
              code: "OK",
              appId: sessionMetadata.appId,
              host: HOST,
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
                // login to the compute node and refresh the password

                // connect as user so that
                // the service node doesn't need to be able to connect to compute nodes with public key
                return await sshConnect(host, userId, logger, async (computeNodeSsh) => {
                  const password = await refreshPassword(computeNodeSsh, null, logger, displayId!);
                  return {
                    code: "OK",
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
        return { code: "UNAVAILABLE" };

      });
    },
  };
};

