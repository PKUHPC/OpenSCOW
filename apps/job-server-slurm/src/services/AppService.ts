import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { getConfigFromFile } from "@scow/config";
import { APP_SERVER_CONFIG_BASE_PATH, AppServerConfigSchema } from "@scow/config/build/appConfig/appServer";
import { randomUUID } from "crypto";
import fs from "fs";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { generateJobScript, parseSbatchOutput, sftpExists } from "src/bl/submitJob";
import { clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { AppServiceServer, AppServiceService, AppSession, AppSession_RunInfo } from "src/generated/portal/app";
import { loggedExec } from "src/plugins/ssh";
import { promisify } from "util";

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
}

const SERVER_ENTRY_PATH = "assets/server_entry.sh";

const ENTRY_COMMAND = fs.readFileSync(SERVER_ENTRY_PATH, { encoding: "utf-8" });

const SESSION_METADATA_NAME = "session.json";

const SESSION_INFO = "SESSION_INFO";

export const appServiceServer = plugin((server) => {
  server.addService<AppServiceServer>(AppServiceService, {
    createApp: async ({ request, logger }) => {
      const { appId, cluster, userId, account, coreCount, maxTime, partition, qos } = request;

      // prepare script file
      const appConfig = getConfigFromFile(AppServerConfigSchema, join(APP_SERVER_CONFIG_BASE_PATH, appId));

      const node = clustersConfig[cluster].loginNodes[0];

      const jobName = randomUUID();

      const workingDirectory = join(config.APP_JOBS_DIR, jobName);

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        // make sure workingDirectory exists.
        await ssh.mkdir(workingDirectory);

        // Copy the beforeScript and script
        const sftp = await ssh.requestSFTP();

        const writeFile = promisify(sftp.writeFile.bind(sftp));
        await writeFile(join(workingDirectory, "before.sh"), appConfig.beforeScript);
        await writeFile(join(workingDirectory, "script.sh"), appConfig.script);

        // Generate

        const script = generateJobScript({
          jobName,
          command: ENTRY_COMMAND,
          account: account,
          coreCount: coreCount,
          maxTime: maxTime,
          nodeCount: 1,
          partition: partition,
          workingDirectory,
          qos: qos,
        });

        const remoteEntryPath = join(workingDirectory, "entry.sh");
        await writeFile(remoteEntryPath, script);

        // submit entry.sh
        const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
          "sbatch", [remoteEntryPath],
          { stream: "both", execOptions: { env: { SESSION_INFO } } },
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

        await writeFile(join(workingDirectory, SESSION_METADATA_NAME), JSON.stringify(metadata));

        return [{ jobId: metadata.jobId, sessionId: metadata.sessionId }];
      });
    },

    getSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.APP_JOBS_DIR)) { return [{ sessions: []}]; }

        const list = await promisify(sftp.readdir.bind(sftp))(config.APP_JOBS_DIR);

        const resultMap: Map<number, AppSession> = new Map();

        await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(config.APP_JOBS_DIR, filename);
          const metadataPath = join(jobDir, SESSION_METADATA_NAME);

          if (!await sftpExists(sftp, metadataPath)) {
            return;
          }

          const readFile = promisify(sftp.readFile.bind(sftp));

          const content = await readFile(metadataPath);
          const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

          // try to read the info file
          const infoFilePath = join(jobDir, SESSION_INFO);

          let runInfo: AppSession_RunInfo | undefined = undefined;

          if (await sftpExists(sftp, infoFilePath)) {
            const content = (await readFile(infoFilePath)).toString();

            // FORMAT: HOST\nPORT\nPASSWORD

            const [host, port, password] = content.split("\n");

            runInfo = { host, port: +port, password };
          }

          resultMap.set(sessionMetadata.jobId, {
            jobId: sessionMetadata.jobId,
            appId: sessionMetadata.appId,
            sessionId: sessionMetadata.sessionId,
            submitTime: new Date(sessionMetadata.submitTime),
            state: "ENDED",
            runInfo,
          });

        }));

        // using squeue to query the running jobs of the user
        // and update the states of the sessions
        const jobs = [...resultMap.values()];
        const states = await queryJobInfo(ssh, logger, ["-u", userId]);
        states.forEach((x) => {
          const job = resultMap.get(+x.jobId);
          if (job) {
            job.state = x.state;
          }
        });

        return [{ sessions: jobs }];
      });
    },


  });

});
