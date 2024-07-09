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

import { DesktopOps } from "src/clusterops/api/desktop";
import { configClusters } from "src/config/clusters";
import { getLoginNodeFromAddress } from "src/utils/scowd";

import { scowdDesktopServices } from "./scowdDesktop";
import { sshDesktopServices } from "./sshDesktop";


export const desktopOps = (cluster: string, host?: string): DesktopOps => {

  const clusterInfo = configClusters[cluster];
  const loginNode = host ? getLoginNodeFromAddress(cluster, host) : undefined;

  if (clusterInfo.scowd?.enabled && loginNode?.scowdPort) {
    return {
      ...scowdDesktopServices(cluster),
    };
  } else {
    return {
      ...sshDesktopServices(cluster),
    };
  }
};
