import { join } from "path";
import { JobOps, SavedJob } from "src/clusterops/api/job";
import { querySacct, querySqueue } from "src/clusterops/slurm/bl/queryJobInfo";
import { generateJobScript, JobMetadata, parseSbatchOutput } from "src/clusterops/slurm/bl/submitJob";
import { runtimeConfig } from "src/utils/config";
import { sftpExists, sftpReaddir, sftpReadFile, sftpWriteFile } from "src/utils/sftp";
import { getClusterLoginNode, loggedExec, sshConnect } from "src/utils/ssh";

export const slurmJobOps = (cluster: string): JobOps => {

  const host = getClusterLoginNode(cluster);

  if (!host) { throw new Error(`Cluster ${cluster} has no login node`); }

  return {
    getAccounts: async (request, logger) => {
      const { userId }  = request;

      const accounts = await sshConnect(host, userId, logger, async (ssh) => {
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

      return await sshConnect(host, userId, logger, async (ssh) => {

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

          await ssh.mkdir(runtimeConfig.SAVED_JOBS_DIR);

          const filePath = join(runtimeConfig.SAVED_JOBS_DIR, id);
          const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };
          await sftpWriteFile(sftp)(filePath, JSON.stringify(metadata));

          logger.info("Saved job to %s", filePath);
        }

        return { code: "OK", jobId };
      });
    },

    getSavedJob: async (request, logger) => {
      const { id, userId } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const file = join(runtimeConfig.SAVED_JOBS_DIR, id);
        
        if (!await sftpExists(sftp, file)) { return { code: "NOT_FOUND" };}

        const content = await sftpReadFile(sftp)(file);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return { code: "OK", jobInfo: data };
      });
    },

    getSavedJobs: async (request, logger) => {
      const { userId } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, runtimeConfig.SAVED_JOBS_DIR)) { return { results: []}; }

        const list = await sftpReaddir(sftp)(runtimeConfig.SAVED_JOBS_DIR);

        const results = await Promise.all(list.map(async ({ filename }) => {
          const content = await sftpReadFile(sftp)(join(runtimeConfig.SAVED_JOBS_DIR, filename));
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

      return await sshConnect(host, userId, logger, async (ssh) => {

        const jobs = await querySqueue(ssh, logger, ["-u", userId]);

        return { jobs };
      });

    },

    cancelJob: async (request, logger) => {
      const { jobId, userId } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        await loggedExec(ssh, logger, true, "scancel", [jobId + ""]);
        return { code: "OK" };
      });
    },

    getAllJobsInfo: async (request, logger) => {
      const { userId, startTime, endTime } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        const jobs = await querySacct(ssh, logger, startTime, endTime);

        return { jobs };
      });
    },


  };
};
