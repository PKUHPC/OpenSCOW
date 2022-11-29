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
import { createSlurmClusterOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";

const clusterOpsMaps = {
  "slurm": createSlurmClusterOps,
} as const;

const opsForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  prev[cluster] = clusterOpsMaps[c.scheduler](cluster);
  return prev;
}, {} as Record<string, ClusterOps>);

export const getClusterOps = (cluster: string) => {
  return opsForClusters[cluster];
};
