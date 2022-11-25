import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AppType } from "@scow/config/build/app";
import { getClusterOps } from "src/clusterops";
import { apps } from "src/config/apps";
import {
  AppCustomAttribute,
  appCustomAttribute_AttributeTypeFromJSON,
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

      const app = apps[appId];
      if (!app) {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }
      const attributesConfig = app.attributes;
      attributesConfig?.forEach((attribute) => {
        if (!(attribute.name in customAttributes)) {
          throw <ServiceError> { 
            code: Status.INVALID_ARGUMENT, 
            message: `custom form attribute ${attribute.name} is not found`,
          };
        } 

        switch (attribute.type) {
        case "number":
          if (!(typeof customAttributes[attribute.name] === "number")) {
            throw <ServiceError> { 
              code: Status.INVALID_ARGUMENT, 
              message: `
              custom form attribute ${attribute.name} should be of type number,
              but of type ${typeof customAttributes[attribute.name]}`,
            };
          }
          break;

        case "text":
          if (!(typeof customAttributes[attribute.name] === "string")) {
            throw <ServiceError> { 
              code: Status.INVALID_ARGUMENT, 
              message: `
              custom form attribute ${attribute.name} should be of type string,
              but of type ${typeof customAttributes[attribute.name]}`,
            };
          }
          break;

        case "select":
          if (!(typeof customAttributes[attribute.name] === "string")) {
            throw <ServiceError> { 
              code: Status.INVALID_ARGUMENT, 
              message: `
              custom form attribute ${attribute.name} should be of type string,
              but of type ${typeof customAttributes[attribute.name]}`,
            };
          }
          // check the option selected by user is in select attributes as the config defined 
          if (!(attribute.select!.some((optionItem) => optionItem.value === customAttributes[attribute.name]))) {
            throw <ServiceError> { 
              code: Status.INVALID_ARGUMENT, 
              message: `
              the option value of ${attribute.name} selected by user should be
              one of select attributes as the ${appId} config defined,
              but is ${customAttributes[attribute.name]}`,
            };
          }
          break;

        default:
          throw new Error(`
          the custom form attributes type in ${appId} config should be one of number, text or select,
          but the type of ${attribute.name} is ${attribute.type}`);
        }
      });

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
        customAttributes,
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
      const attributes: AppCustomAttribute[] = [];
      if (app.attributes) {
        app.attributes.forEach((item) => {
          attributes.push({
            type: appCustomAttribute_AttributeTypeFromJSON(item.type),
            label: item.label,
            name: item.name,
            options: item.select ?? [],
          });
        });
      }

      return [{ attributes: attributes }];
    },
  });

});
