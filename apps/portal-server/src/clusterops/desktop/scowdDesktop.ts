/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ServiceError, status } from "@grpc/grpc-js";
import { getScowdClient } from "@scow/lib-scowd/build/client";
import { Desktop } from "@scow/protos/build/portal/desktop";
import { DesktopOps } from "src/clusterops/api/desktop";
import { getDesktopConfig } from "src/utils/desktops";
import { scowdClientNotFound } from "src/utils/errors";
import { certificates, getLoginNodeScowdUrl, mapTRPCExceptionToGRPC } from "src/utils/scowd";
import { displayIdToPort, getTurboVNCBinPath } from "src/utils/turbovnc";

export const scowdDesktopServices = (cluster: string): DesktopOps => ({
  createDesktop: async (request) => {
    const { loginNode: host, wm, userId, desktopName } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
    const { maxDesktops, desktopsDir } = getDesktopConfig(cluster);

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw { code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` } as ServiceError;
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    try {
      const res = await client.desktop.createDesktop({
        userId,
        vncServerBinPath: vncserverBinPath,
        maxDesktops, wm, desktopName,
        desktopDir: desktopsDir, loginNode: host,
      });
  
      return { host, password: res.password, port: displayIdToPort(res.displayId) };
      
    } catch (err) {
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  killDesktop: async (request) => {

    const { loginNode: host, displayId, userId } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw { code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` } as ServiceError;
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    const { desktopsDir } = getDesktopConfig(cluster);

    try {
      await client.desktop.killDesktop({
        userId, vncServerBinPath: vncserverBinPath,
        displayId, desktopDir: desktopsDir, loginNode: host,
      });
  
      return {};
      
    } catch (err) {
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  connectToDesktop: async (request) => {

    const { loginNode: host, displayId, userId } = request;

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw { code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` } as ServiceError;
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    const vncPasswdPath = getTurboVNCBinPath(cluster, "vncpasswd");

    try {
      const res = await client.desktop.connectToDesktop({ userId, vncPasswdPath: vncPasswdPath, displayId });

      return { host, port: displayIdToPort(displayId), password: res.password };
      
    } catch (err) {
      throw mapTRPCExceptionToGRPC(err);
    }
  },

  listUserDesktops: async (request) => {

    const { loginNode: host, userId } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
    const { desktopsDir } = getDesktopConfig(cluster);

    const scowdUrl = getLoginNodeScowdUrl(cluster, host);

    if (!scowdUrl) {
      throw { code: status.INTERNAL, details: `Cluster ${cluster} not have login node ${host}` } as ServiceError;
    }

    const client = getScowdClient(scowdUrl, certificates);
    if (!client) { throw scowdClientNotFound(scowdUrl); }

    try {
      const res = await client.desktop.listUserDesktops({
        userId,
        vncServerBinPath: vncserverBinPath,
        loginNode: host,
        desktopDir: desktopsDir,
      });
  
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
      throw mapTRPCExceptionToGRPC(err);
    }
  },
});