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
import { portalConfig } from "src/config/portal";
import { dnsResolve } from "src/utils/dns";
import { clusterNotFound } from "src/utils/errors";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";
import { displayIdToPort,
  parseDisplayId, parseListOutput, parseOtp, refreshPassword, VNCSERVER_BIN_PATH } from "src/utils/turbovnc";

function ensureEnabled() {
  if (!portalConfig.loginDesktop.enabled) {
    throw <ServiceError>{ code: Status.UNAVAILABLE, message: "Login deskto is not enabled" };
  }
}

export const desktopServiceServer = plugin((server) => {

  server.addService<DesktopServiceServer>(DesktopServiceService, {
    createDesktop: async ({ request, logger }) => {
      const { cluster, wm, userId } = request;

      ensureEnabled();

      if (portalConfig.loginDesktop.wms.find((x) => x.wm === wm) === undefined) {
        throw <ServiceError>{ code: Status.INVALID_ARGUMENT, message: `${wm} is not a acceptable wm.` };
      }

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, "root", logger, async (ssh) => {
        // find if the user has running session
        let resp = await executeAsUser(ssh, userId, logger, true,
          VNCSERVER_BIN_PATH, ["-list"],
        );

        const ids = parseListOutput(resp.stdout);

        if (ids.length >= portalConfig.loginDesktop.maxDesktops) {
          throw <ServiceError> { code: Status.RESOURCE_EXHAUSTED, message: "Too many desktops" };
        }

        // start a session

        // explicitly set securitytypes to avoid requiring setting vnc passwd
        const params = ["-securitytypes", "OTP", "-otp"];

        if (wm) {
          params.push("-wm");
          params.push(wm);
        }

        resp = await executeAsUser(ssh, userId, logger, true, VNCSERVER_BIN_PATH, params);

        // parse the OTP from output. the output was in stderr
        const password = parseOtp(resp.stderr);
        // parse display id from output
        const displayId = parseDisplayId(resp.stderr);

        const port = displayIdToPort(displayId);

        return [{ host: await dnsResolve(host), password, port }];

      });
    },

    killDesktop: async ({ request, logger }) => {
      ensureEnabled();

      const { cluster, displayId, userId } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, "root", logger, async (ssh) => {

        // kill specific desktop
        await executeAsUser(ssh, userId, logger, true, VNCSERVER_BIN_PATH, ["-kill", ":" + displayId]);

        return [{}];
      });

    },

    connectToDesktop: async ({ request, logger }) => {

      ensureEnabled();

      const { cluster, displayId, userId } = request;


      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, "root", logger, async (ssh) => {

        const password = await refreshPassword(ssh, userId, logger, displayId);

        return [{ host: await dnsResolve(host), port: displayIdToPort(displayId), password }];
      });

    },

    listUserDesktops: async ({ request, logger }) => {

      ensureEnabled();

      const { cluster, userId } = request;

      const host = getClusterLoginNode(cluster);

      if (!host) { throw clusterNotFound(cluster); }

      return await sshConnect(host, "root", logger, async (ssh) => {

        // list all running session
        const resp = await executeAsUser(ssh, userId, logger, true,
          VNCSERVER_BIN_PATH, ["-list"],
        );

        const ids = parseListOutput(resp.stdout);

        return [{
          host,
          displayIds: ids,
        }];
      });

    },

    listAvailableWms: async ({}) => {
      ensureEnabled();

      const result = portalConfig.loginDesktop.wms;

      return [{ wms: result }];
    },

  });

});
