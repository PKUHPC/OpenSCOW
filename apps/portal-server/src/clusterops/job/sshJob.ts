import { ServiceError } from "@ddadaal/tsgrpc-common";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { sftpExists, sftpReaddir, sftpReadFile, sftpUnlink, sftpWriteFile } from "@scow/lib-ssh";
import { join } from "path";
import { JobOps, JobTemplateInfo } from "src/clusterops/api/job";
import { portalConfig } from "src/config/portal";
import { sshConnect } from "src/utils/ssh";

import { JobMetadata } from "./index";

export const sshJobServices = (host: string): JobOps => ({

  getJobTemplate: async (request, logger) => {
    const { id, userId } = request;

    return await sshConnect(host, userId, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      const file = join(portalConfig.savedJobsDir, id);

      if (!await sftpExists(sftp, file)) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      const content = await sftpReadFile(sftp)(file);
      logger.info("getJobTamplate to %s", content);

      try {
        const data = JSON.parse(content.toString()) as JobMetadata;
        return { template: data };
      } catch (error) {
        logger.error("Parsing JSON failed, error is %o", error);
        throw {
          code: Status.INTERNAL,
          message: "Parsing JSON failed",
        } as ServiceError;
      }
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
        let data: JobMetadata | object = {};

        try {
          data = JSON.parse(content.toString()) as JobMetadata;
        } catch (error) {
          logger.error("Parsing JSON failed, the content is %s,the error is %o",content.toString(),error);
        }

        return {
          id: filename,
          submitTime: ("submitTime" in data && data.submitTime) ? new Date(data.submitTime) : new Date(),
          comment: ("comment" in data && data.comment) ? data.comment : "",
          jobName: ("jobName" in data && data.jobName) ? data.jobName : "unknown",
        } as JobTemplateInfo;
      }));

      return { results };
    });
  },

  saveJobTemplate: async (request, logger) => {
    const { userId, jobId, jobInfo } = request;

    return await sshConnect(host, userId, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      const id = `${jobInfo.jobName}-${jobId}`;
      logger.info("Save job to %s", id);

      await ssh.mkdir(portalConfig.savedJobsDir);

      const filePath = join(portalConfig.savedJobsDir, id);
      const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };
      await sftpWriteFile(sftp)(filePath, JSON.stringify(metadata));

      logger.info("Saved job as template to %s", filePath);

      return {};
    });

  },

  deleteJobTemplate: async (request, logger) => {
    const { id, userId } = request;

    return await sshConnect(host, userId, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      const file = join(portalConfig.savedJobsDir, id);

      if (!await sftpExists(sftp, file)) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      await sftpUnlink(sftp)(file);

      return {};
    });

  },

  renameJobTemplate: async (request, logger) => {
    const { id, userId, jobName } = request;

    return await sshConnect(host, userId, logger, async (ssh) => {
      const sftp = await ssh.requestSFTP();

      const file = join(portalConfig.savedJobsDir, id);

      if (!await sftpExists(sftp, file)) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      const content = await sftpReadFile(sftp)(file);

      try {
        const data = JSON.parse(content.toString()) as JobMetadata;
        data.jobName = jobName;


        await sftpWriteFile(sftp)(file, JSON.stringify(data));
        return {};
      } catch (error) {
        logger.error("Parsing JSON file %s failed, error is %o", file, error);
        throw { code: Status.INTERNAL, message: "Parsing JSON failed" } as ServiceError;
      }
    });

  },
});
