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

import { FileOps } from "src/clusterops/api/file";
import { configClusters } from "src/config/clusters";
import { clusterNotFound } from "src/utils/errors";
import { getScowdClient } from "src/utils/scowd";
import { getClusterLoginNode } from "src/utils/ssh";

import { scowdFileServices } from "./scowdFile";
import { sshFileServices } from "./sshFile";


export const fileOps = (cluster: string): FileOps => {

  const clusterInfo = configClusters[cluster];
  if (clusterInfo.scowd?.enabled) {
    const client = getScowdClient(cluster);

    return {
      ...scowdFileServices(client),
    };
  } else {
    const host = getClusterLoginNode(cluster);

    if (!host) { throw clusterNotFound(cluster); }

    return {
      ...sshFileServices(host),
    };
  }
};
