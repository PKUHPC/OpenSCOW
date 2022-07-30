import { loggedExec, sftpExists, sftpReaddir, sftpReadFile, sftpWriteFile, sshConnect } from "@scow/lib-ssh";
import { join } from "path";
import { JobOps, SavedJob } from "src/clusterops/api/job";
import { querySacct, querySqueue } from "src/clusterops/slurm/bl/queryJobInfo";
import { generateJobScript, JobMetadata, parseSbatchOutput } from "src/clusterops/slurm/bl/submitJob";
import { runtimeConfig } from "src/utils/config";
import { getClusterLoginNode } from "src/utils/ssh";

export const slurmJobOps = (cluster: string): JobOps => {

  const host = getClusterLoginNode(cluster);

  if (!host) { throw new Error(`Cluster ${cluster} has no login node`); }

  return {
    getAccounts: async (request, logger) => {
      const { userId }  = request;

      const accounts = await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {
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

      return { accounts };
    },

    generateJobScript: async (request) => {
      const script = generateJobScript(request.jobInfo);

      return { script };
    },

    submitJob: async (request, logger) => {
      const { jobInfo, userId, save } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {

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
          return { code: "SBATCH_FAILED", message: stderr };
        }

        // parse stdout output to get the job id
        const jobId = parseSbatchOutput(stdout);

        if (save) {
          const id = `${jobInfo.jobName}-${jobId}`;
          logger.info("Save job to %s", id);

          await ssh.mkdir(runtimeConfig.PORTAL_CONFIG.savedJobsDir);

          const filePath = join(runtimeConfig.PORTAL_CONFIG.savedJobsDir, id);
          const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };
          await sftpWriteFile(sftp)(filePath, JSON.stringify(metadata));

          logger.info("Saved job to %s", filePath);
        }

        return { code: "OK", jobId };
      });
    },

    getSavedJob: async (request) => {
      const { id, userId } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const file = join(runtimeConfig.PORTAL_CONFIG.savedJobsDir, id);

        if (!await sftpExists(sftp, file)) { return { code: "NOT_FOUND" };}

        const content = await sftpReadFile(sftp)(file);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return { code: "OK", jobInfo: data };
      });
    },

    getSavedJobs: async (request) => {
      const { userId } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, runtimeConfig.PORTAL_CONFIG.savedJobsDir)) { return { results: []}; }

        const list = await sftpReaddir(sftp)(runtimeConfig.PORTAL_CONFIG.savedJobsDir);

        const results = await Promise.all(list.map(async ({ filename }) => {
          const content = await sftpReadFile(sftp)(join(runtimeConfig.PORTAL_CONFIG.savedJobsDir, filename));
          const data = JSON.parse(content.toString()) as JobMetadata;

          return {
            id: filename,
            submitTime: data.submitTime,
            comment: data.comment,
            jobName: data.jobName,
          } as SavedJob;
        }));

        return { results };
      });
    },

    getRunningJobs: async (request, logger) => {
      const { userId } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {

        const jobs = await querySqueue(ssh, logger, ["-u", userId]);

        return { jobs };
      });

    },

    cancelJob: async (request, logger) => {
      const { jobId, userId } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {
        await loggedExec(ssh, logger, true, "scancel", [jobId + ""]);
        return { code: "OK" };
      });
    },

    getAllJobsInfo: async (request, logger) => {
      const { userId, startTime, endTime } = request;

      return await sshConnect(host, userId, runtimeConfig.SSH_PRIVATE_KEY_PATH, async (ssh) => {
        const jobs = await querySacct(ssh, logger, startTime, endTime);

        return { jobs };
      });
    },


  };
};
