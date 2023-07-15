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

import { executeAsUser } from "@scow/lib-ssh";
import { UserDesktops } from "@scow/protos/build/portal/desktop";
import { sshConnect } from "src/utils/ssh";
import { getTurboVNCBinPath, parseListOutput } from "src/utils/turbovnc";
import { Logger } from "ts-log";

/**
 *
 * @param host loginode
 * @param userId user id
 * @param cluster cluster id
 * @param logger logger
 * @returns userDesktops
 */
export async function listUserDesktopsFromHost(host: string, cluster: string, userId: string, logger: Logger) {

  const vncserverBinPath = getTurboVNCBinPath(cluster, "vncserver");

  return await sshConnect(host, "root", logger, async (ssh) => {

    // list all running session
    const resp = await executeAsUser(ssh, userId, logger, true,
      vncserverBinPath, ["-list"],
    );

    const ids = parseListOutput(resp.stdout);
    const userDesktops = { host, displayIds: ids } as UserDesktops;

    return userDesktops;
  });
}
