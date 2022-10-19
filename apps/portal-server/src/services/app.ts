import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getClusterOps } from "src/clusterops";
import { apps } from "src/config/apps";
import { AppServiceServer, AppServiceService } from "src/generated/portal/app";
import { clusterNotFound } from "src/utils/errors";

export const appServiceServer = plugin((server) => {

  server.addService<AppServiceServer>(AppServiceService, {
    connectToApp: async ({ request, logger }) => {
      const { cluster, sessionId, userId } = request;

      const clusterOps = getClusterOps(cluster);

      if (!clusterOps) { throw clusterNotFound(cluster); }

      const reply = await clusterOps.app.connectToApp({
        sessionId, userId,
      }, logger);

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError>{ code: Status.NOT_FOUND, message: `session id ${sessionId} is not found` };
      }

      if (reply.code === "UNAVAILABLE") {
        throw <ServiceError>{ code: Status.UNAVAILABLE, message: `session id ${sessionId} cannot be connected` };
      }

      const app = apps[reply.appId];

      if (!app) {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${reply.appId} is not found` };
      }

      return [{
        host: reply.host,
        port: reply.port,
        password: reply.password,
        web: app.web ? {
          formData: app.web.connect.formData ?? {},
          query: app.web.connect.query ?? {},
          method: app.web.connect.method,
          path: app.web.connect.path,
        } : undefined,
        vnc: app.vnc ? {} : undefined,
      }];
    },

    createAppSession: async ({ request, logger }) => {
      const { account, appId, cluster, coreCount, maxTime, partition, qos, userId } = request;

      const clusterops = getClusterOps(cluster);

      const reply = await clusterops.app.createApp({
        appId,
        userId,
        coreCount,
        account,
        maxTime,
        partition,
        qos,
      }, logger);

      if (reply.code === "SBATCH_FAILED") {
        throw <ServiceError> { code: Status.UNAVAILABLE, message: reply.message };
      }

      if (reply.code === "APP_NOT_FOUND") {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }

      return [{ jobId: reply.jobId, sessionId: reply.sessionId }];

    },

    listAppSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      const reply = await clusterops.app.listAppSessions({ userId }, logger);

      return [{ sessions: reply.sessions }];
    },

  });

});
