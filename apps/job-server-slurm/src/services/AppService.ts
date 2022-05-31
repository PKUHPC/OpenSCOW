import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { getConfigFromFile } from "@scow/config";
import { APP_SERVER_CONFIG_BASE_PATH, AppServerConfigSchema } from "@scow/config/build/appConfig/appServer";
import { randomUUID } from "crypto";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { sftpExists, submitJob } from "src/bl/submitJob";
import { clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { AppServiceServer, AppServiceService, AppSession, AppSession_Address } from "src/generated/portal/app";
import { promisify } from "util";

interface SessionMetadata {
  sessionId: string;
  jobId: number;
  appId: string;
  submitTime: string;
}

const SESSION_METADATA_NAME = "session.json";

const INFO_FILE = "SESSION_INFO";

export const appServiceServer = plugin((server) => {
  server.addService<AppServiceServer>(AppServiceService, {
    createApp: async ({ request, logger }) => {
      const { appId, cluster, userId, account, coreCount, maxTime, partition, qos } = request;

      // prepare script file
      const appConfig = getConfigFromFile(AppServerConfigSchema, join(APP_SERVER_CONFIG_BASE_PATH, appId));

      const node = clustersConfig[cluster].loginNodes[0];

      const jobName = randomUUID();

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        const result = await submitJob({
          logger,
          ssh,
          jobInfo: {
            jobName,
            command: appConfig.script,
            account: account,
            coreCount: coreCount,
            maxTime: maxTime,
            nodeCount: 1,
            partition: partition,
            qos: qos,
          },
        });

        if (result.code === "ALREADY_EXISTS") {
        // this is very unlikely to happen, because job name is UUID
          throw <ServiceError> {
            code: status.ALREADY_EXISTS,
            message: `dir ${result.dir} already exists.`,
          };
        }

        if (result.code === "SBATCH_FAILED") {
          throw <ServiceError> {
            code: status.UNAVAILABLE,
            message: "slurm job submission failed.",
            details: result.message,
          };
        }

        // write session metadata
        const metadata: SessionMetadata = {
          jobId: result.jobId,
          sessionId: jobName,
          submitTime: result.metadata.submitTime,
          appId,
        };

        const writeFile = promisify(result.sftp.writeFile.bind(result.sftp));

        await writeFile(join(result.dir, SESSION_METADATA_NAME), JSON.stringify(metadata));

        return [{ jobId: metadata.jobId, sessionId: metadata.sessionId }];
      });
    },

    getSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.JOBS_DIR)) { return [{ sessions: []}]; }

        const list = await promisify(sftp.readdir.bind(sftp))(config.JOBS_DIR);

        const resultMap: Map<number, AppSession> = new Map();

        await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(config.JOBS_DIR, filename);
          const metadataPath = join(jobDir, SESSION_METADATA_NAME);

          if (!await sftpExists(sftp, metadataPath)) {
            return;
          }

          const readFile = promisify(sftp.readFile.bind(sftp));

          const content = await readFile(metadataPath);
          const sessionMetadata = JSON.parse(content.toString()) as SessionMetadata;

          // try to read the info file
          const infoFilePath = join(jobDir, INFO_FILE);

          let address: AppSession_Address | undefined = undefined;

          if (await sftpExists(sftp, infoFilePath)) {
            const content = (await readFile(infoFilePath)).toString();

            // FORMAT: HOST:PORT

            const [host, port] = content.split(":");

            address = { host, port: +port };
          }

          resultMap.set(sessionMetadata.jobId, {
            jobId: sessionMetadata.jobId,
            appId: sessionMetadata.appId,
            sessionId: sessionMetadata.sessionId,
            submitTime: new Date(sessionMetadata.submitTime),
            state: "ENDED",
            address,
          });

        }));

        // query the state of jobs
        const jobs = [...resultMap.values()];
        const states = await queryJobInfo(ssh, logger, ["-j", [...jobs.values()].map((x) => x.jobId).join(",")]);
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
