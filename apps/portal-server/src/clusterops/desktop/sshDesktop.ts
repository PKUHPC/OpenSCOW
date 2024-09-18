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
import { executeAsUser } from "@scow/lib-ssh";
import { DesktopOps } from "src/clusterops/api/desktop";
import { addDesktopToFile, getDesktopConfig, 
  listUserDesktopsFromHost, removeDesktopFromFile } from "src/utils/desktops";
import { sshConnect } from "src/utils/ssh";
import { displayIdToPort, getTurboVNCBinPath, 
  parseDisplayId, parseListOutput, parseOtp, refreshPassword } from "src/utils/turbovnc";

export const sshDesktopServices = (cluster: string): DesktopOps => ({
  createDesktop: async (request, logger) => {
    const { loginNode: host, wm, userId, desktopName } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");
    const maxDesktops = getDesktopConfig(cluster).maxDesktops;


    return await sshConnect(host, "root", logger, async (ssh) => {

      // find if the user has running session
      let resp = await executeAsUser(ssh, userId, logger, true,
        vncserverBinPath, ["-list"],
      );

      const ids = parseListOutput(resp.stdout);

      if (ids.length >= maxDesktops) {
        throw { code: status.RESOURCE_EXHAUSTED, message: "Too many desktops" } as ServiceError;
      }

      // start a session

      // explicitly set securitytypes to avoid requiring setting vnc passwd
      const params = ["-securitytypes", "OTP", "-otp"];

      if (wm) {
        params.push("-wm");
        params.push(wm);
      }

      if (desktopName) {
        params.push("-name");
        params.push(desktopName);
      }

      resp = await executeAsUser(ssh, userId, logger, true, vncserverBinPath, params);

      // parse the OTP from output. the output was in stderr
      const password = parseOtp(resp.stderr);
      // parse display id from output
      const displayId = parseDisplayId(resp.stderr);

      const port = displayIdToPort(displayId);

      const desktopInfo = {
        host,
        displayId,
        desktopName,
        wm,
        createTime: new Date().toISOString(),
      };

      await addDesktopToFile(ssh, cluster, userId, desktopInfo, logger);

      return { host, password, port };

    });
  },

  killDesktop: async (request, logger) => {

    const { loginNode: host, displayId, userId } = request;

    const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

    return await sshConnect(host, "root", logger, async (ssh) => {

      // kill specific desktop
      await executeAsUser(ssh, userId, logger, true, vncserverBinPath, ["-kill", ":" + displayId]);

      await removeDesktopFromFile(ssh, cluster, userId, host, displayId, logger);

      return {};
    });

  },

  connectToDesktop: async (request, logger) => {

    const { loginNode: host, displayId, userId } = request;

    return await sshConnect(host, "root", logger, async (ssh) => {

      const password = await refreshPassword(ssh, cluster, userId, logger, displayId);

      return { host, port: displayIdToPort(displayId), password };
    });

  },

  listUserDesktops: async (request, logger) => {

    const { loginNode: host, userId } = request;

    const userDesktops = await listUserDesktopsFromHost(host, cluster, userId, logger);
    return { ...userDesktops };
  },
});