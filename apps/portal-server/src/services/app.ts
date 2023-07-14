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

import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { AppType } from "@scow/config/build/app";
import {
  AppCustomAttribute,
  appCustomAttribute_AttributeTypeFromJSON,
  AppServiceServer,
  AppServiceService,
  ConnectToAppResponse,
  WebAppProps_ProxyType,
} from "@scow/protos/build/portal/app";
import { DetailedError, ErrorInfo } from "@scow/rich-error-model";
import { getClusterOps } from "src/clusterops";
import { getClusterAppConfigs } from "src/utils/app";
import { clusterNotFound } from "src/utils/errors";

const errorInfo = (reason: string) =>
  ErrorInfo.create({ domain: "", reason: reason, metadata: {} });

export const appServiceServer = plugin((server) => {

  server.addService<AppServiceServer>(AppServiceService, {
    connectToApp: async ({ request, logger }) => {

      const { cluster, sessionId, userId } = request;

      const apps = getClusterAppConfigs(cluster);

      const clusterOps = getClusterOps(cluster);

      if (!clusterOps) { throw clusterNotFound(cluster); }

      const reply = await clusterOps.app.connectToApp({
        sessionId, userId,
      }, logger);

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
              ? WebAppProps_ProxyType.ABSOLUTE
              : WebAppProps_ProxyType.RELATIVE,
            customFormData: reply.customFormData ?? {},
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

      const { account, appId, appJobName, cluster, coreCount, nodeCount, gpuCount, memory, maxTime,
        proxyBasePath, partition, qos, userId, customAttributes } = request;

      const apps = getClusterAppConfigs(cluster);

      const app = apps[appId];
      if (!app) {
        throw new DetailedError({
          code: Status.NOT_FOUND,
          message: `app id ${appId} is not found`,
          details: [errorInfo("NOT FOUND")],
        });
      }
      const attributesConfig = app.attributes;
      attributesConfig?.forEach((attribute) => {
        if (attribute.required && !(attribute.name in customAttributes) && attribute.name !== "sbatchOptions") {
          throw new DetailedError({
            code: Status.INVALID_ARGUMENT,
            message: `custom form attribute ${attribute.name} is required but not found`,
            details: [errorInfo("INVALID ARGUMENT")],
          });
        }

        switch (attribute.type) {
        case "number":
          if (customAttributes[attribute.name] && Number.isNaN(Number(customAttributes[attribute.name]))) {
            throw new DetailedError({
              code: Status.INVALID_ARGUMENT,
              message: `
                custom form attribute ${attribute.name} should be of type number,
                but of type ${typeof customAttributes[attribute.name]}`,
              details: [errorInfo("INVALID ARGUMENT")],
            });
          }
          break;

        case "text":
          break;

        case "select":
          // check the option selected by user is in select attributes as the config defined
          if (customAttributes[attribute.name]
            && !(attribute.select!.some((optionItem) => optionItem.value === customAttributes[attribute.name]))) {
            throw new DetailedError({
              code: Status.INVALID_ARGUMENT,
              message: `
                the option value of ${attribute.name} selected by user should be
                one of select attributes as the ${appId} config defined,
                but is ${customAttributes[attribute.name]}`,
              details: [errorInfo("INVALID ARGUMENT")],
            });
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
        appJobName,
        userId,
        coreCount,
        nodeCount,
        gpuCount,
        memory,
        account,
        maxTime,
        partition,
        qos,
        customAttributes,
        proxyBasePath,
      }, logger);

      return [{ jobId: reply.jobId, sessionId: reply.sessionId }];

    },

    listAppSessions: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.app.listAppSessions({ userId }, logger);

      return [{ sessions: reply.sessions.map((x) => ({ ...x, submitTime: x.submitTime?.toISOString() })) }];
    },

    getAppMetadata: async ({ request }) => {

      const { appId, cluster } = request;
      const apps = getClusterAppConfigs(cluster);
      const app = apps[appId];

      if (!app) {
        throw <ServiceError> { code: Status.NOT_FOUND, message: `app id ${appId} is not found` };
      }
      const attributes: AppCustomAttribute[] = [];
      if (app.attributes) {
        app.attributes.forEach((item) => {
          const attributeType = item.type.toUpperCase();

          let defaultInput: AppCustomAttribute["defaultInput"];
          if (item.defaultValue && typeof item.defaultValue === "number") {
            defaultInput = { $case: "number", number: item.defaultValue };
          } else if (item.defaultValue && typeof item.defaultValue === "string") {
            defaultInput = { $case: "text", text: item.defaultValue };
          }

          attributes.push({
            type: appCustomAttribute_AttributeTypeFromJSON(attributeType),
            label: item.label,
            name: item.name,
            required: item.required,
            defaultInput: defaultInput,
            placeholder: item.placeholder,
            options: item.select ?? [],
          });
        });
      }

      return [{ appName: app.name, attributes: attributes }];
    },

    listAvailableApps: async ({ request }) => {

      const { cluster } = request;

      const apps = getClusterAppConfigs(cluster);

      return [{
        apps: Object.keys(apps)
          .map((x) => ({ id: x, name: apps[x].name, logoPath: apps[x].logoPath || undefined })),
      }];
    },

    getAppLastSubmission: async ({ request, logger }) => {

      const { userId, cluster, appId } = request;
      const clusterops = getClusterOps(cluster);

      if (!clusterops) { throw clusterNotFound(cluster); }

      const reply = await clusterops.app.getAppLastSubmission({
        userId, appId,
      }, logger);

      return [{
        lastSubmissionInfo: reply.lastSubmissionInfo,
      }];
    },
  });

});
