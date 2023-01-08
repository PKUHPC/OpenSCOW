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

import { getRunningJobs } from "@scow/lib-slurm";
import { executeAsUser, loggedExec, sftpExists, sftpReaddir, sftpReadFile, sftpWriteFile } from "@scow/lib-ssh";
import { join } from "path";
import { JobOps, JobTemplate } from "src/clusterops/api/job";
import { querySacct } from "src/clusterops/slurm/bl/queryJobInfo";
import { generateJobScript, JobMetadata, parseSbatchOutput } from "src/clusterops/slurm/bl/submitJob";
import { portalConfig } from "src/config/portal";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export const slurmJobOps = (cluster: string): JobOps => {

  const host = getClusterLoginNode(cluster);

  if (!host) { throw new Error(`Cluster ${cluster} has no login node`); }

  return {
    listAccounts: async (request, logger) => {
      const { userId } = request;

      const accounts = await sshConnect(host, "root", logger, async (ssh) => {
        const { stdout } = await executeAsUser(ssh, userId, logger, true,
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
      const { jobInfo, userId, saveAsTemplate } = request;

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

        if (saveAsTemplate) {
          const id = `${jobInfo.jobName}-${jobId}`;
          logger.info("Save job to %s", id);

          await ssh.mkdir(portalConfig.savedJobsDir);

          const filePath = join(portalConfig.savedJobsDir, id);
          const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };
          await sftpWriteFile(sftp)(filePath, JSON.stringify(metadata));

          logger.info("Saved job as template to %s", filePath);
        }

        return { code: "OK", jobId };
      });
    },

    getJobTamplate: async (request, logger) => {
      const { id, userId } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const file = join(portalConfig.savedJobsDir, id);

        if (!await sftpExists(sftp, file)) { return { code: "NOT_FOUND" }; }

        const content = await sftpReadFile(sftp)(file);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return { code: "OK", jobInfo: data };
      });
    },

    listJobTemplates: async (request, logger) => {
      const { userId } = request;

      return await sshConnect(host, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await sftpExists(sftp, portalConfig.savedJobsDir)) { return { results: []}; }

        const list = await sftpReaddir(sftp)(portalConfig.savedJobsDir);

        const results = await Promise.all(list.map(async ({ filename }) => {
          const content = await sftpReadFile(sftp)(join(portalConfig.savedJobsDir, filename));
          const data = JSON.parse(content.toString()) as JobMetadata;

          return {
            id: filename,
            submitTime: new Date(data.submitTime),
            comment: data.comment,
            jobName: data.jobName,
          } as JobTemplate;
        }));

        return { results };
      });
    },

    listRunningJobs: async (request, logger) => {
      const { userId } = request;
      
      return await sshConnect(host, "root", logger, async (ssh) => {
        const results = await getRunningJobs(ssh, userId, { userId }, logger);

        return { results };
      });

    },

    cancelJob: async (request, logger) => {
      const { jobId, userId } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {
        await executeAsUser(ssh, userId, logger, true, "scancel", [jobId + ""]);
        return { code: "OK" };
      });
    },

    listAllJobsInfo: async (request, logger) => {
      const { userId, startTime, endTime } = request;

      return await sshConnect(host, "root", logger, async (ssh) => {
        const results = await querySacct(ssh, userId, logger, startTime, endTime);

        return { results };
      });
    },


  };
};
