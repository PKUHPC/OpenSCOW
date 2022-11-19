import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AppType } from "@scow/config/build/app";
import { getClusterOps } from "src/clusterops";
import { apps } from "src/config/apps";
import {
  AppCustomAttribute,
  AppServiceServer,
  AppServiceService,
  ConnectToAppResponse,
  WebAppProps_ProxyType,
} from "src/generated/portal/app";
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

      let appProps: ConnectToAppResponse["appProps"];

      switch (app.type) {
      case AppType.vnc:
        appProps = {
          $case: "vnc",
          vnc: {},
        };
        break;
      case AppType.web:
        appProps = {
          $case: "web",
          web: {
            formData: app.web!.connect.formData ?? {},
            query: app.web!.connect.query ?? {},
            method: app.web!.connect.method,
            path: app.web!.connect.path,
            proxyType: app.web!.proxyType === "absolute"
              ? WebAppProps_ProxyType.absolute
              : WebAppProps_ProxyType.relative,
          },
        };
        break;
      default:
        throw new Error(`Unknown app type ${app.type} of app id ${reply.appId}`);
      }

      return [{
        host: reply.host,
        port: reply.port,
        password: reply.password,
        appProps,
      }];
    },

    createAppSession: async ({ request, logger }) => {
      const { account, appId, cluster, coreCount, maxTime, partition, qos, userId, customAttributes } = request;
      logger.info("Get custom form fields %s.", customAttributes.toString());
      // todo

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

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
        throw <ServiceError> { code: Status.INTERNAL, message: "sbatch failed", details: reply.message };
      }

      if (reply.code === "APP_NOT_FOUND") {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }

      return [{ jobId: reply.jobId, sessionId: reply.sessionId }];

    },

    listAppSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.app.listAppSessions({ userId }, logger);

      return [{ sessions: reply.sessions }];
    },

    getAppAttributes: async ({ request }) => {
      const { appId } = request;
      const app = apps[appId];

      if (!app) {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }

      const attributes:AppCustomAttribute[] = app.attributes ?? [];
      return [{ attributes: attributes }];
    },
  });

});
