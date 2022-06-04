import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError, status } from "@grpc/grpc-js";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { generateJobScript, JobMetadata, sftpExists, submitJob } from "src/bl/submitJob";
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
      const { cluster, jobInfo, userId, save } = ensureNotUndefined(request, ["jobInfo"]);

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        const reply = await submitJob({
          jobInfo,
          logger,
          ssh,
        });

        if (reply.code === "SBATCH_FAILED") {
          throw <ServiceError> {
            code: status.UNAVAILABLE,
            message: "slurm job submission failed.",
            details: reply.message,
          };
        }

        if (save) {
          const id = `${jobInfo.jobName}-${reply.jobId}`;
          logger.info("Save job to %s", id);

          await ssh.mkdir(config.SAVED_JOBS_DIR);

          const filePath = join(config.SAVED_JOBS_DIR, id);
          await ssh.withSFTP(async (sftp) => {
            const metadata: JobMetadata = { ...jobInfo, submitTime: reply.submitTime.toISOString() };
            await promisify(sftp.writeFile.bind(sftp))(filePath, JSON.stringify(metadata));
          });

          logger.info("Saved job to %s", filePath);
        }

        return [{ jobId: reply.jobId }];
      });
    },

    getSavedJob: async ({ request, logger }) => {
      const { cluster, id, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const file = join(config.SAVED_JOBS_DIR, id);

        const content = await promisify(sftp.readFile.bind(sftp))(file);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return [{ jobInfo: data }];
      });
    },

    getSavedJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.SAVED_JOBS_DIR)) { return [{ results: []}]; }

        const list = await promisify(sftp.readdir.bind(sftp))(config.SAVED_JOBS_DIR);

        const results = await Promise.all(list.map(async ({ filename }) => {
          const content = await promisify(sftp.readFile.bind(sftp))(join(config.SAVED_JOBS_DIR, filename));
          const data = JSON.parse(content.toString()) as JobMetadata;

          return {
            id: filename,
            submitTime: new Date(data.submitTime),
            comment: data.comment,
            jobName: data.jobName,
          } as SavedJob;
        }));

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
