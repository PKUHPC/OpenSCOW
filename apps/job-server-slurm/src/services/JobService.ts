import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError, status } from "@grpc/grpc-js";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { generateJobScript, JOB_METADATA_NAME, JobMetadata, sftpExists, submitJob } from "src/bl/submitJob";
import { checkClusterExistence, clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { JobServiceServer, JobServiceService, SavedJob } from "src/generated/portal/job";
import { loggedExec } from "src/plugins/ssh";
import { promisify } from "util";




export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    getAccounts: async ({ request, logger }) => {
      const { cluster, userId }  = request;

      const node = clustersConfig[cluster].loginNodes[0];
      const accounts = await server.ext.connect(node, userId, logger, async (ssh) => {
        const { stdout } = await loggedExec(ssh, logger, true,
          "sacctmgr", ["show", "ass", `user=${userId}`, "format=account%20"]);

        /**
          Account
      --------------------
      {account1}
      {account2}
         */

        const accounts = stdout.split("\n").slice(2).map((x) => x.trim());

        return accounts;
      });

      return [{ accounts }];
    },

    generateJobScript: async ({ request }) => {
      const { jobInfo } = ensureNotUndefined(request, ["jobInfo"]);

      const script = generateJobScript(jobInfo);

      return [{ script }];
    },

    submitJob: async ({ request, logger }) => {
      const { cluster, jobInfo, userId } = ensureNotUndefined(request, ["jobInfo"]);

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        const reply = await submitJob({
          jobInfo,
          logger,
          ssh,
        });

        if (reply.code === "ALREADY_EXISTS") {
          throw <ServiceError> {
            code: status.ALREADY_EXISTS,
            message: `dir ${reply.dir} already exists.`,
          };
        }

        if (reply.code === "SBATCH_FAILED") {
          throw <ServiceError> {
            code: status.UNAVAILABLE,
            message: "slurm job submission failed.",
            details: reply.message,
          };
        }

        return [{ jobId: reply.jobId }];
      });
    },

    getSavedJob: async ({ request, logger }) => {
      const { cluster, jobName, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const dir = join(config.JOBS_DIR, jobName);
        const metadataPath = join(dir, JOB_METADATA_NAME);

        const content = await promisify(sftp.readFile.bind(sftp))(metadataPath);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return [{ jobInfo: data }];
      });
    },

    getSavedJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.JOBS_DIR)) { return [{ results: []}]; }

        const list = await promisify(sftp.readdir.bind(sftp))(config.JOBS_DIR);

        const results = (await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(config.JOBS_DIR, filename);
          const metadataPath = join(jobDir, JOB_METADATA_NAME);

          if (!await sftpExists(sftp, config.JOBS_DIR)) {
            return undefined;
          }
          const content = await promisify(sftp.readFile.bind(sftp))(metadataPath);
          const data = JSON.parse(content.toString()) as JobMetadata;

          const absJobDir = await promisify(sftp.realpath.bind(sftp))(jobDir);

          return { jobName: data.jobName, submitTime: new Date(data.submitTime),
            comment: data.comment,  dirPath: absJobDir,
          };
        }))).filter((x) => x) as SavedJob[];

        return [{ results }];
      });
    },

    getRunningJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;

      checkClusterExistence(cluster);
      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        const jobs = await queryJobInfo(ssh, logger, ["-u", userId]);

        return [{ jobs }];
      });

    },

    cancelJob: async ({ request, logger }) => {
      const { cluster, jobId, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        await loggedExec(ssh, logger, true, "scancel", [jobId + ""]);
        return [{}];
      });
    },

  });
});
