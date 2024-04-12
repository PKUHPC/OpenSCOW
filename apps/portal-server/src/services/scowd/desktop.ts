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

import { ConnectError } from "@connectrpc/connect";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getLoginNode } from "@scow/config/build/cluster";
import { getScowdClient } from "@scow/lib-scowd/build/client";
import { Desktop, DesktopServiceServer, DesktopServiceService } from "@scow/protos/build/portal/desktop";
import { clusters } from "src/config/clusters";
import { ensureEnabled, getDesktopConfig } from "src/utils/desktops";
import { clusterNotFound, scowdClientNotFound } from "src/utils/errors";
import { certificates, convertCodeToGrpcStatus, getScowdUrlFromLoginNodeAddress } from "src/utils/scowd";
import { checkLoginNodeInCluster } from "src/utils/ssh";
import { displayIdToPort, getTurboVNCBinPath } from "src/utils/turbovnc";

export const scowdDesktopServiceServer = plugin((server) => {

  server.addService<DesktopServiceServer>(DesktopServiceService, {
    createDesktop: async ({ request, logger }) => {
      const { cluster, loginNode: host, wm, userId, desktopName } = request;

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("createDesktop started");

      ensureEnabled(cluster);

      const availableWms = getDesktopConfig(cluster).wms;

      if (availableWms.find((x) => x.wm === wm) === undefined) {
        throw <ServiceError>{ code: Status.INVALID_ARGUMENT, message: `${wm} is not a acceptable wm.` };
      }

      checkLoginNodeInCluster(cluster, host);

      const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
      const { maxDesktops, desktopsDir } = getDesktopConfig(cluster);

      const loginNodeScowdUrl = getScowdUrlFromLoginNodeAddress(cluster, host);

      if (!loginNodeScowdUrl) {
        subLogger.info(`loginNode ${host} don't have scowdUrl`);
        throw <ServiceError>{ code: Status.INTERNAL, message: `loginNode ${host} don't have scowdUrl` };
      }
      const client = getScowdClient(loginNodeScowdUrl, certificates);

      if (!client) { throw scowdClientNotFound(loginNodeScowdUrl); }

      try {
        const res = await client.desktop.createDesktop({
          vncServerBinPath: vncserverBinPath,
          maxDesktops, wm, desktopName,
          desktopDir: desktopsDir, loginNode: host,
        },
        { headers: { IdentityId: userId } });

        return [{ host, password: res.password, port: displayIdToPort(res.displayId) }];
      } catch (err) {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while creating desktop ${desktopName}`,
        };
      }
    },

    killDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("killDesktop started");

      ensureEnabled(cluster);
      checkLoginNodeInCluster(cluster, host);

      const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

      const loginNodeScowdUrl = getScowdUrlFromLoginNodeAddress(cluster, host);

      if (!loginNodeScowdUrl) {
        subLogger.info(`loginNode ${host} don't have scowdUrl`);
        throw <ServiceError>{ code: Status.INTERNAL, message: `loginNode ${host} don't have scowdUrl` };
      }

      const client = getScowdClient(loginNodeScowdUrl, certificates);

      if (!client) { throw scowdClientNotFound(loginNodeScowdUrl); }

      const { desktopsDir } = getDesktopConfig(cluster);

      try {
        await client.desktop.killDesktop({
          vncServerBinPath: vncserverBinPath,
          displayId, desktopDir: desktopsDir, loginNode: host,
        },
        { headers: { IdentityId: userId } });

        return [{}];
      } catch (err) {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while killing desktop on port ${displayIdToPort(displayId)}`,
        };
      }
    },

    connectToDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("connectToDesktop started");

      ensureEnabled(cluster);
      checkLoginNodeInCluster(cluster, host);

      const loginNodeScowdUrl = getScowdUrlFromLoginNodeAddress(cluster, host);

      if (!loginNodeScowdUrl) {
        subLogger.info(`loginNode ${host} don't have scowdUrl`);
        throw <ServiceError>{ code: Status.INTERNAL, message: `loginNode ${host} don't have scowdUrl` };
      }

      const client = getScowdClient(loginNodeScowdUrl, certificates);
      if (!client) { throw scowdClientNotFound(loginNodeScowdUrl); }

      const vncPasswdPath = getTurboVNCBinPath(cluster, "vncpasswd");

      try {
        const res = await client.desktop.connectToDesktop({ vncPasswdPath: vncPasswdPath, displayId },
          { headers: { IdentityId: userId } });

        return [{ host, port: displayIdToPort(displayId), password: res.password }];
      } catch (err) {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while connecting to desktop on port ${displayIdToPort(displayId)}`,
        };
      }

    },

    listUserDesktops: async ({ request, logger }) => {

      const { cluster, loginNode: host, userId } = request;

      ensureEnabled(cluster);

      const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
      const { desktopsDir } = getDesktopConfig(cluster);

      const subLogger = logger.child({ userId, cluster });
      subLogger.info("listUserDesktops started");

      if (host) {
        checkLoginNodeInCluster(cluster, host);
        const loginNodeScowdUrl = getScowdUrlFromLoginNodeAddress(cluster, host);

        if (!loginNodeScowdUrl) {
          subLogger.info(`loginNode ${host} don't have scowdUrl`);
          throw <ServiceError>{ code: Status.INTERNAL, message: `loginNode ${host} don't have scowdUrl` };
        }

        const client = getScowdClient(loginNodeScowdUrl, certificates);
        if (!client) { throw scowdClientNotFound(loginNodeScowdUrl); }

        try {
          const res = await client.desktop.listUserDesktops({
            vncServerBinPath: vncserverBinPath,
            loginNode: host,
            desktopDir: desktopsDir,
          }, { headers: { IdentityId: userId } });

          const userDeskTops: Desktop[] = res.userDesktops.map((desktop) => {

            const createTime = !desktop.createTime ? undefined
              : new Date(Number((desktop.createTime.seconds * BigInt(1000))
                + BigInt(desktop.createTime.nanos / 1000000)));

            return {
              desktopName: desktop.desktopName,
              displayId: desktop.displayId,
              wm: desktop.wm,
              createTime: createTime?.toISOString(),
            };
          });

          return [{ userDesktops:  [{ host, desktops: userDeskTops }]}];
        } catch (err) {
          subLogger.error(err);
          if (err instanceof ConnectError) {
            throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
          }
          throw <ServiceError>{
            code: status.UNKNOWN,
            details: `An unknown error occurred while list user ${userId} desktop`,
          };
        }
      }

      const loginNodes = clusters[cluster]?.loginNodes?.map(getLoginNode);
      if (!loginNodes) {
        throw clusterNotFound(cluster);
      }
      // 请求集群的所有登录节点
      const reply = await Promise.all(loginNodes.map(async (loginNode) => {
        if (!loginNode.scowdUrl) {
          subLogger.info(`loginNode ${loginNode.address} don't have scowdUrl`);
          throw <ServiceError>{ code: Status.INTERNAL, message: `loginNode ${loginNode.address} don't have scowdUrl` };
        }

        const client = getScowdClient(loginNode.scowdUrl, certificates);
        if (!client) { throw scowdClientNotFound(loginNode.scowdUrl); }

        const res = await client.desktop.listUserDesktops({
          vncServerBinPath: vncserverBinPath,
          loginNode: loginNode.address,
          desktopDir: desktopsDir,
        }, { headers: { IdentityId: userId } });

        const userDesktops: Desktop[] = res.userDesktops.map((desktop) => {

          const createTime = !desktop.createTime ? undefined
            : new Date(Number((desktop.createTime.seconds * BigInt(1000))
              + BigInt(desktop.createTime.nanos / 1000000)));

          return {
            desktopName: desktop.desktopName,
            displayId: desktop.displayId,
            wm: desktop.wm,
            createTime: createTime?.toISOString(),
          };
        });

        return { host: loginNode.address, desktops: userDesktops };

      })).catch((err) => {
        subLogger.error(err);
        if (err instanceof ConnectError) {
          throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
        }
        throw <ServiceError>{
          code: status.UNKNOWN,
          details: `An unknown error occurred while list user ${userId} desktop`,
        };
      });

      return [{ userDesktops: reply }];
    },

    listAvailableWms: async ({ request }) => {

      const { cluster } = request;

      ensureEnabled(cluster);

      const result = getDesktopConfig(cluster).wms;


      return [{ wms: result }];
    },

  });

});
