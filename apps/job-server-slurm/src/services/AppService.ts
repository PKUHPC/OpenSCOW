import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { getConfigFromFile } from "@scow/config";
import { APP_CONFIG_BASE_PATH, AppConfigSchema } from "@scow/config/build/appConfig/app";
import { randomUUID } from "crypto";
import fs from "fs";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { generateJobScript, parseSbatchOutput } from "src/bl/submitJob";
import { getAppConfig } from "src/config/apps";
import { clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { RunningJob } from "src/generated/common/job";
import { AppServiceServer, AppServiceService, AppSession } from "src/generated/portal/app";
import { displayIdToPort } from "src/utils/port";
import { sftpChmod, sftpExists, sftpReaddir, sftpReadFile, sftpWriteFile } from "src/utils/sftp";
import { loggedExec, sshConnect } from "src/utils/ssh";
import { parseDisplayId, refreshPassword, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
}

const SERVER_ENTRY_COMMAND = fs.readFileSync("assets/server_entry.sh", { encoding: "utf-8" });
const VNC_ENTRY_COMMAND = fs.readFileSync("assets/vnc_entry.sh", { encoding: "utf-8" });

const VNC_OUTPUT_FILE = "output";

const SESSION_METADATA_NAME = "session.json";

const SERVER_SESSION_INFO = "SERVER_SESSION_INFO";
const VNC_SESSION_INFO = "VNC_SESSION_INFO";


export const appServiceServer = plugin((server) => {
  server.addService<AppServiceServer>(AppServiceService, {
    createApp: async ({ request, logger }) => {
      const { appId, cluster, userId, account, coreCount, maxTime, partition, qos } = request;

      // prepare script file
      const appConfig = getAppConfig(appId);

      const node = clustersConfig[cluster].loginNodes[0];

      const jobName = randomUUID();

      const workingDirectory = join(config.APP_JOBS_DIR, jobName);

      return await sshConnect(node, userId, logger, async (ssh) => {

        // make sure workingDirectory exists.
        await ssh.mkdir(workingDirectory);

        const sftp = await ssh.requestSFTP();

        const submitAndWriteMetadata = async (script: string, env?: NodeJS.ProcessEnv) => {
          const remoteEntryPath = join(workingDirectory, "entry.sh");

          await sftpWriteFile(sftp)(remoteEntryPath, script);

          // submit entry.sh
          const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
            "sbatch", [remoteEntryPath], { execOptions: { env } },
          );

          if (code !== 0) {
            throw <ServiceError> {
              code: status.UNAVAILABLE,
              message: "slurm job submission failed.",
              details: stderr,
            };
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
          return metadata;
        };

        if (appConfig.type === "web") {
          await sftpWriteFile(sftp)(join(workingDirectory, "before.sh"), appConfig.beforeScript);
          await sftpWriteFile(sftp)(join(workingDirectory, "script.sh"), appConfig.script);

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
            nodeList: appConfig.nodes?.join(","),
          });

          const metadata = await submitAndWriteMetadata(script, { SERVER_SESSION_INFO });

          return [{ jobId: metadata.jobId, sessionId: metadata.sessionId }];

        } else {
          const xstartupPath = join(workingDirectory, "xstartup");
          await sftpWriteFile(sftp)(xstartupPath, appConfig.xstartup);
          await sftpChmod(sftp)(xstartupPath, "755");

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
            nodeList: appConfig.nodes?.join(","),
          });

          const metadata = await submitAndWriteMetadata(script, { VNC_SESSION_INFO, VNCSERVER_BIN_PATH });
          return [{ jobId: metadata.jobId, sessionId: metadata.sessionId }];
        }

      });
    },

    getSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await sshConnect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.APP_JOBS_DIR)) { return [{ sessions: []}]; }

        const list = await sftpReaddir(sftp)(config.APP_JOBS_DIR);

        // using squeue to get jobs that are running
        // If a job is not running, it cannot be ready
        const runningJobsInfo = await queryJobInfo(ssh, logger, ["-u", userId]);

        const runningJobInfoMap = runningJobsInfo.reduce((prev, curr) => {
          prev[curr.jobId] = curr;
          return prev;
        }, {} as Record<number, RunningJob>);

        const sessions = [] as AppSession[];

        await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(config.APP_JOBS_DIR, filename);
          const metadataPath = join(jobDir, SESSION_METADATA_NAME);

          if (!await sftpExists(sftp, metadataPath)) {
            return;
          }

          const content = await sftpReadFile(sftp)(metadataPath);
          const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

          const runningJobInfo: RunningJob | undefined = runningJobInfoMap[sessionMetadata.jobId];

          const app = getAppConfig(sessionMetadata.appId);

          let ready = false;

          // judge whether the app is ready
          if (runningJobInfo && runningJobInfo.state === "RUNNING") {
            if (app.type === "web") {
            // for server apps,
            // try to read the SESSION_INFO file to get port and password
              const infoFilePath = join(jobDir, SERVER_SESSION_INFO);
              ready = await sftpExists(sftp, infoFilePath);

            } else {
            // for vnc apps,
            // try to find the output file and try to parse the display number
              const outputFilePath = join(jobDir, VNC_OUTPUT_FILE);

              if (await sftpExists(sftp, outputFilePath)) {
                const content = (await sftpReadFile(sftp)(outputFilePath)).toString();
                try {
                  parseDisplayId(content, logger);
                  ready = true;
                } catch {
                // ignored if displayId cannot be parsed
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
          });

        }));



        return [{ sessions }];
      });
    },

    connectToApp: async ({ request, logger }) => {
      const { cluster, sessionId, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await sshConnect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const jobDir = join(config.APP_JOBS_DIR, sessionId);

        if (!await sftpExists(sftp, jobDir)) {
          throw <ServiceError>{
            code: status.NOT_FOUND,
            message: `dir ${jobDir} does not exist`,
          };
        }

        const metadataPath = join(jobDir, SESSION_METADATA_NAME);
        const content = await sftpReadFile(sftp)(metadataPath);
        const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

        const app = getAppConfig(sessionMetadata.appId);

        if (app.type === "web") {
          const infoFilePath = join(jobDir, SERVER_SESSION_INFO);
          if (await sftpExists(sftp, infoFilePath)) {
            const content = (await sftpReadFile(sftp)(infoFilePath)).toString();

            // FORMAT: HOST\nPORT\nPASSWORD

            const [host, port, password] = content.split("\n");

            return [{ appId: app.id, host, port: +port, password }];
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
                displayId = parseDisplayId(content, logger);
              } catch {
                // ignored if displayId cannot be parsed
              }
              if (displayId) {

                // the server is run at the compute node
                // login to the compute node and refresh the password

                if (displayId) {
                  return await sshConnect(host, userId, logger, async (computeNodeSsh) => {
                    if (displayId) {
                      const password = await refreshPassword(computeNodeSsh, logger, displayId);
                      return [{ appId: app.id, host, port: displayIdToPort(displayId), password }];
                    }
                  });
                }
              }

            }
          }
        }

        throw <ServiceError> {
          code: status.UNAVAILABLE,
        };
      });
    },
  });
});

