import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError, status } from "@grpc/grpc-js";
import { join } from "path";
import { queryJobInfo } from "src/bl/queryJobInfo";
import { generateJobScript, JobMetadata, parseSbatchOutput } from "src/bl/submitJob";
import { checkClusterExistence, clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { JobServiceServer, JobServiceService, SavedJob } from "src/generated/portal/job";
import { sftpExists, sftpReaddir, sftpReadFile, sftpWriteFile } from "src/utils/sftp";
import { loggedExec, sshConnect } from "src/utils/ssh";

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    getAccounts: async ({ request, logger }) => {
      const { cluster, userId }  = request;

      const node = clustersConfig[cluster].loginNodes[0];
      const accounts = await sshConnect(node, userId, logger, async (ssh) => {
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

      return await sshConnect(node, userId, logger, async (ssh) => {

        const dir = jobInfo.workingDirectory;

        const script = generateJobScript(jobInfo);

        const sftp = await ssh.requestSFTP();

        // make sure workingDirectory exists.
        await ssh.mkdir(dir, undefined, sftp);

        // use sbatch to allocate the script. pass the script into sbatch in stdin
        const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
          "sbatch", [],
          { stdin: script },
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

        if (save) {
          const id = `${jobInfo.jobName}-${jobId}`;
          logger.info("Save job to %s", id);

          await ssh.mkdir(config.SAVED_JOBS_DIR);

          const filePath = join(config.SAVED_JOBS_DIR, id);
          const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };
          await sftpWriteFile(sftp)(filePath, JSON.stringify(metadata));

          logger.info("Saved job to %s", filePath);
        }

        return [{ jobId }];
      });
    },

    getSavedJob: async ({ request, logger }) => {
      const { cluster, id, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await sshConnect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const file = join(config.SAVED_JOBS_DIR, id);

        const content = await sftpReadFile(sftp)(file);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return [{ jobInfo: data }];
      });
    },

    getSavedJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await sshConnect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, config.SAVED_JOBS_DIR)) { return [{ results: []}]; }

        const list = await sftpReaddir(sftp)(config.SAVED_JOBS_DIR);

        const results = await Promise.all(list.map(async ({ filename }) => {
          const content = await sftpReadFile(sftp)(join(config.SAVED_JOBS_DIR, filename));
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

      return await sshConnect(node, userId, logger, async (ssh) => {

        const jobs = await queryJobInfo(ssh, logger, ["-u", userId]);

        return [{ jobs }];
      });

    },

    cancelJob: async ({ request, logger }) => {
      const { cluster, jobId, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await sshConnect(node, userId, logger, async (ssh) => {
        await loggedExec(ssh, logger, true, "scancel", [jobId + ""]);
        return [{}];
      });
    },

  });
});
