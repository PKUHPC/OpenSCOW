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

import { sftpUnlink, sshRmrf } from "@scow/lib-ssh";
import { logger } from "src/server/utils/logger";

import { sshConnect } from "./ssh";

interface DeleteFileProps {
  host: string;
  userIdentityId: string;
  filePath: string;
}

interface DeleteDirProps {
  host: string;
  userIdentityId: string;
  dirPath: string;
}


export const deleteFile = async ({ host, userIdentityId, filePath }: DeleteFileProps) => {
  await sshConnect(host, userIdentityId, logger, async (ssh) => {

    const sftp = await ssh.requestSFTP();

    await sftpUnlink(sftp)(filePath);

    return {};
  });
};

export const deleteDir = async ({ host, userIdentityId, dirPath }: DeleteDirProps) => {
  await sshConnect(host, userIdentityId, logger, async (ssh) => {

    await sshRmrf(ssh, dirPath);

    return {};
  });
};
