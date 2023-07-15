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
import { executeAsUser } from "@scow/lib-ssh";
import { DesktopServiceServer, DesktopServiceService } from "@scow/protos/build/portal/desktop";
import { clusters } from "src/config/clusters";
import { ensureEnabled, getDesktopConfig } from "src/utils/desktop";
import { listUserDesktopsFromHost } from "src/utils/desktops";
import { clusterNotFound } from "src/utils/errors";
import { checkLoginNodeInCluster, sshConnect } from "src/utils/ssh";
import { displayIdToPort,
  getTurboVNCBinPath,
  parseDisplayId, parseListOutput, parseOtp, refreshPassword } from "src/utils/turbovnc";

export const desktopServiceServer = plugin((server) => {

  server.addService<DesktopServiceServer>(DesktopServiceService, {
    createDesktop: async ({ request, logger }) => {
      const { cluster, loginNode: host, wm, userId } = request;

      ensureEnabled(cluster);

      const availableWms = getDesktopConfig(cluster).wms;

      if (availableWms.find((x) => x.wm === wm) === undefined) {
        throw <ServiceError>{ code: Status.INVALID_ARGUMENT, message: `${wm} is not a acceptable wm.` };
      }

      checkLoginNodeInCluster(cluster, host);

      const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
      const maxDesktops = getDesktopConfig(cluster).maxDesktops;


      return await sshConnect(host, "root", logger, async (ssh) => {

        // find if the user has running session
        let resp = await executeAsUser(ssh, userId, logger, true,
          vncserverBinPath, ["-list"],
        );

        const ids = parseListOutput(resp.stdout);

        if (ids.length >= maxDesktops) {
          throw <ServiceError> { code: Status.RESOURCE_EXHAUSTED, message: "Too many desktops" };
        }

        // start a session

        // explicitly set securitytypes to avoid requiring setting vnc passwd
        const params = ["-securitytypes", "OTP", "-otp"];

        if (wm) {
          params.push("-wm");
          params.push(wm);
        }

        resp = await executeAsUser(ssh, userId, logger, true, vncserverBinPath, params);

        // parse the OTP from output. the output was in stderr
        const password = parseOtp(resp.stderr);
        // parse display id from output
        const displayId = parseDisplayId(resp.stderr);

        const port = displayIdToPort(displayId);

        return [{ host, password, port }];

      });
    },

    killDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;

      ensureEnabled(cluster);

      checkLoginNodeInCluster(cluster, host);

      const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

      return await sshConnect(host, "root", logger, async (ssh) => {

        // kill specific desktop
        await executeAsUser(ssh, userId, logger, true, vncserverBinPath, ["-kill", ":" + displayId]);

        return [{}];
      });

    },

    connectToDesktop: async ({ request, logger }) => {

      const { cluster, loginNode: host, displayId, userId } = request;

      ensureEnabled(cluster);

      checkLoginNodeInCluster(cluster, host);

      return await sshConnect(host, "root", logger, async (ssh) => {

        const password = await refreshPassword(ssh, cluster, userId, logger, displayId);

        return [{ host, port: displayIdToPort(displayId), password }];
      });

    },

    listUserDesktops: async ({ request, logger }) => {

      const { cluster, loginNode: host, userId } = request;

      ensureEnabled(cluster);


      if (host) {
        checkLoginNodeInCluster(cluster, host);
        const userDesktops = await listUserDesktopsFromHost(host, cluster, userId, logger);
        return [{ userDesktops: [userDesktops]}];
      }

      const loginNodes = clusters[cluster]?.loginNodes;
      if (!loginNodes) {
        throw clusterNotFound(cluster);
      }
      // 请求集群的所有登录节点
      return await Promise.all(loginNodes.map(async (loginNode) => {
        return await listUserDesktopsFromHost(loginNode.address, cluster, userId, logger);
      })).then((response) => {
        return [{ userDesktops: response }];
      });
    },

    listAvailableWms: async ({ request }) => {

      const { cluster } = request;

      ensureEnabled(cluster);

      const result = getDesktopConfig(cluster).wms;


      return [{ wms: result }];
    },

  });

});
