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

import { ClusterOps } from "src/clusterops/api";
import { appOps } from "src/clusterops/app";
import { desktopOps } from "src/clusterops/desktop";
import { fileOps } from "src/clusterops/file";
import { jobOps } from "src/clusterops/job";
import { configClusters } from "src/config/clusters";

const clusters = configClusters;

export const getClusterOps = (cluster: string, host?: string) => {
  const opsForClusters = Object.entries(clusters).reduce((prev, [c]) => {
    prev[c] = {
      app: appOps(c),
      job: jobOps(c),
      desktop: desktopOps(c, host),
      file: fileOps(c),
    } as ClusterOps;
    return prev;
  }, {} as Record<string, ClusterOps>);

  return opsForClusters[cluster];
};
