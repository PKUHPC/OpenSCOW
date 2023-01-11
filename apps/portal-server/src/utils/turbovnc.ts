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

import { executeAsUser, loggedExec } from "@scow/lib-ssh";
import { NodeSSH } from "node-ssh";
import { join } from "path";
import { portalConfig } from "src/config/portal";
import { Logger } from "ts-log";

export const VNCSERVER_BIN_PATH = join(portalConfig.turboVNCPath, "bin", "vncserver");

export function parseListOutput(output: string): number[] {
  const ids = [] as number[];
  for (const line of output.split("\n")) {
    if (line.startsWith(":")) {
      const parts = line.split(" ");
      ids.push(parseInt(parts[0].substring(1)));
    }
  }

  return ids;
}

export function parseOtp(stderr: string): string {
  const indicator = "Full control one-time password: ";
  for (const line of stderr.split("\n")) {
    if (line.startsWith(indicator)) {
      return line.substring(indicator.length).trim();
    }
  }

  throw new Error("Error parsing OTP");
}

export function parseDisplayId(stdout: string): number {

  // Desktop 'TurboVNC: t001:2 (2001213077)' started on display t001:2
  // Desktop 'TurboVNC: cn1:21 (demo_admin)' started on display cn1:21
  const regex = /^Desktop '.*' started on display .*:(\d+)$/;

  const lines = stdout.split("\n");

  for (const line of lines) {
    const matches = line.match(regex);
    if (!matches) { continue; }

    return +matches[1];
  }

  // logger.error("Error parsing display id from %s", stdout);
  throw new Error("Error parsing display id");
}

const vncPasswdPath = join(portalConfig.turboVNCPath, "bin", "vncpasswd");

/**
 * Refresh VNC session's OTP
 * @param ssh SSH connection
 * @param runAsUserId the user id to run as. If null, run as SSH connection user
 * @param logger logger
 * @param displayId displayId
 * @returns new OTP
 */
export const refreshPassword = async (ssh: NodeSSH, runAsUserId: string | null, logger: Logger, displayId: number) => {

  const params = ["-o", "-display", ":" + displayId];

  const resp = runAsUserId
    ? await executeAsUser(ssh, runAsUserId, logger, true, vncPasswdPath, params)
    : await loggedExec(ssh, logger, true, vncPasswdPath, params);

  return parseOtp(resp.stderr);
};

