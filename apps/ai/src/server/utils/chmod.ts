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

import { TRPCError } from "@trpc/server";
import { logger } from "src/server/utils/logger";

import { sshConnect } from "./ssh";

interface chmodProps {
  host: string;
  userIdentityId: string;
  permission: string;
  path: string;
}

export const chmod = async ({ host, userIdentityId, permission, path }: chmodProps) => {
  await sshConnect(host, userIdentityId, logger, async (ssh) => {

    const resp = await ssh.exec("chmod", ["-R", permission, path], { stream: "both" });

    if (resp.code !== 0) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "chmod command failed", cause: resp.stderr });
    }

    return {};
  });
};
