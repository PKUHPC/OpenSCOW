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
import { ServiceError, status } from "@grpc/grpc-js";
import { getScowdClient } from "@scow/lib-scowd/build/client";
import { Desktop } from "@scow/protos/build/portal/desktop";
import { DesktopOps } from "src/clusterops/api/desktop";
import { getDesktopConfig } from "src/utils/desktops";
import { scowdClientNotFound } from "src/utils/errors";
import { certificates, convertCodeToGrpcStatus, getLoginNodeScowdUrl } from "src/utils/scowd";
import { displayIdToPort, getTurboVNCBinPath } from "src/utils/turbovnc";

export const scowdDesktopServices = (cluster: string): DesktopOps => ({
  CreateDesktop: async (request, logger) => {
    const { loginNode: host, wm, userId, desktopName } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
    const { maxDesktops, desktopsDir } = getDesktopConfig(cluster);

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw <ServiceError>{ code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` };
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    try {
      const res = await client.desktop.createDesktop({
        vncServerBinPath: vncserverBinPath,
        maxDesktops, wm, desktopName,
        desktopDir: desktopsDir, loginNode: host,
      },
      { headers: { IdentityId: userId } });

      return { host, password: res.password, port: displayIdToPort(res.displayId) };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while creating desktop ${desktopName}`,
      };
    }
  },

  KillDesktop: async (request, logger) => {

    const { loginNode: host, displayId, userId } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw <ServiceError>{ code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` };
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    const { desktopsDir } = getDesktopConfig(cluster);

    try {
      await client.desktop.killDesktop({
        vncServerBinPath: vncserverBinPath,
        displayId, desktopDir: desktopsDir, loginNode: host,
      },
      { headers: { IdentityId: userId } });

      return {};
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while killing desktop on port ${displayIdToPort(displayId)}`,
      };
    }
  },

  ConnectToDesktop: async (request, logger) => {

    const { loginNode: host, displayId, userId } = request;

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw <ServiceError>{ code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` };
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    const vncPasswdPath = getTurboVNCBinPath(cluster, "vncpasswd");

    try {
      const res = await client.desktop.connectToDesktop({ vncPasswdPath: vncPasswdPath, displayId },
        { headers: { IdentityId: userId } });

      return { host, port: displayIdToPort(displayId), password: res.password };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while connecting to desktop on port ${displayIdToPort(displayId)}`,
      };
    }

  },

  ListUserDesktops: async (request, logger) => {

    const { loginNode: host, userId } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
    const { desktopsDir } = getDesktopConfig(cluster);

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw <ServiceError>{ code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` };
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

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

      return { 
        host, 
        desktops: userDeskTops.map((desktop) => {
          return {
            displayId: desktop.displayId,
            desktopName: desktop.desktopName,
            wm: desktop.wm,
            createTime: desktop.createTime,
          };
        }),
      };
    } catch (err) {
      logger.error(err);
      if (err instanceof ConnectError) {
        throw <ServiceError>{ code: convertCodeToGrpcStatus(err.code), details: err.message };
      }
      throw <ServiceError>{
        code: status.UNKNOWN,
        details: `An unknown error occurred while list user ${userId} desktop`,
      };
    }
  },
});