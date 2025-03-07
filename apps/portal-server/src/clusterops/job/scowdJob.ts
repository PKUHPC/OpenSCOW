import { ServiceError } from "@ddadaal/tsgrpc-common";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { ScowdClient } from "@scow/lib-scowd/build/client";
import { join } from "path";
import { JobOps, JobTemplateInfo } from "src/clusterops/api/job";
import { portalConfig } from "src/config/portal";
import { mapTRPCExceptionToGRPC } from "src/utils/scowd";

import { JobMetadata } from "./index";

export const scowdJobServices = (client: ScowdClient): JobOps => ({

  getJobTemplate: async (request, logger) => {
    const { id, userId } = request;

    try {
      const userHomeDir = (await client.file.getHomeDirectory({ userId })).path;
      const filePath = join(userHomeDir, portalConfig.savedJobsDir, id);

      const { exists } = await client.file.exists({ userId, path: filePath });

      if (!exists) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      const { content } = await client.file.readFile({ userId, filePath });

      logger.info("getJobTamplate to %s", content);

      try {
        const data = JSON.parse(content.toString()) as JobMetadata;
        return { template: data };
      } catch (error) {
        logger.error("Parsing JSON file %s failed, error is %o", filePath, error);
        throw { code: Status.INTERNAL, message: "Parsing JSON failed" } as ServiceError;
      }
    } catch (err) {
      if (err instanceof ServiceError) {
        throw err;
      }
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  listJobTemplates: async (request, logger) => {
    const { userId } = request;

    try {
      const userHomeDir = (await client.file.getHomeDirectory({ userId })).path;

      const { exists } = await client.file.exists({ userId, path: join(userHomeDir, portalConfig.savedJobsDir) });

      if (!exists) {
        return { results: []};
      }

      const { filesInfo } = await client.file.readDirectory({
        userId, dirPath: join(userHomeDir, portalConfig.savedJobsDir),
      });

      const results = await Promise.all(filesInfo.map(async ({ name }) => {
        const filePath = join(userHomeDir, portalConfig.savedJobsDir, name);
        const { content } = await client.file.readFile({ userId, filePath });

        let data: JobMetadata | object = {};

        try {
          data = JSON.parse(content.toString()) as JobMetadata;
        } catch (error) {
          logger.error("Parsing JSON file %s failed, the content is %s,the error is %o",
            filePath, content.toString(),error);
        }

        return {
          id: name,
          submitTime: ("submitTime" in data && data.submitTime) ? new Date(data.submitTime) : new Date(),
          comment: ("comment" in data && data.comment) ? data.comment : "",
          jobName: ("jobName" in data && data.jobName) ? data.jobName : "unknown",
        } as JobTemplateInfo;
      }));

      return { results };

    } catch (err) {
      if (err instanceof ServiceError) {
        throw err;
      }
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  saveJobTemplate: async (request, logger) => {
    const { userId, jobId, jobInfo } = request;

    const id = `${jobInfo.jobName}-${jobId}`;
    logger.info("Save job to %s", id);

    try {
      const userHomeDir = (await client.file.getHomeDirectory({ userId })).path;

      const { exists } = await client.file.exists({ userId, path: join(userHomeDir, portalConfig.savedJobsDir) });

      if (!exists) {
        await client.file.makeDirectory({ userId, dirPath: join(userHomeDir, portalConfig.savedJobsDir) });
      }

      const filePath = join(userHomeDir, portalConfig.savedJobsDir, id);
      const metadata: JobMetadata = { ...jobInfo, submitTime: new Date().toISOString() };

      await client.file.writeFile({ userId, filePath, content: JSON.stringify(metadata) });

      logger.info("Saved job as template to %s", filePath);

      return {};
    } catch (err) {
      if (err instanceof ServiceError) {
        throw err;
      }
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  deleteJobTemplate: async (request) => {
    const { id, userId } = request;

    try {
      const userHomeDir = (await client.file.getHomeDirectory({ userId })).path;
      const filePath = join(userHomeDir, portalConfig.savedJobsDir, id);

      const { exists } = await client.file.exists({ userId, path: filePath });

      if (!exists) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      await client.file.deleteFile({ userId, filePath });

      return {};
    } catch (err) {
      if (err instanceof ServiceError) {
        throw err;
      }
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  renameJobTemplate: async (request, logger) => {
    const { id, userId, jobName } = request;

    try {
      const userHomeDir = (await client.file.getHomeDirectory({ userId })).path;
      const filePath = join(userHomeDir, portalConfig.savedJobsDir, id);

      const { exists } = await client.file.exists({ userId, path: filePath });

      if (!exists) {
        throw { code: Status.NOT_FOUND, message: `Job template id ${id} is not found.` } as ServiceError;
      }

      const { content } = await client.file.readFile({ userId, filePath });
      try {
        const data = JSON.parse(content.toString()) as JobMetadata;
        data.jobName = jobName;

        await client.file.writeFile({ userId, filePath, content: JSON.stringify(data) });

        return {};
      } catch (error) {
        logger.error("Parsing JSON file %s failed, error is %o", filePath, error);
        throw { code: Status.INTERNAL, message: "Parsing JSON failed" } as ServiceError;
      }
    } catch (err) {
      if (err instanceof ServiceError) {
        throw err;
      }
      throw mapTRPCExceptionToGRPC(err);
    }
  },
});
