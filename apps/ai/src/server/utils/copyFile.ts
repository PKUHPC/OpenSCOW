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

import { loggedExec } from "@scow/lib-ssh";
import { TRPCError } from "@trpc/server";
import { logger } from "src/server/utils/logger";

import { sshConnect } from "./ssh";

interface CopyFileProps {
  host: string;
  userIdentityId: string;
  fromPath: string;
  toPath: string;
}

export const copyFile = async ({ host, userIdentityId, fromPath, toPath }: CopyFileProps) => {
  await sshConnect(host, userIdentityId, logger, async (ssh) => {
    // the SFTPWrapper doesn't supprt copy
    // Use command to do it
    const resp = await loggedExec(ssh, logger, false, "cp", ["-r", fromPath, toPath]);

    if (resp.code !== 0) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "cp command failed", cause: resp.stderr });
    }

    return {};
  });
};
