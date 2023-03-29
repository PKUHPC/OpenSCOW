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

import { clusters } from "src/config/clusters";


interface ClusterLoginNode {
  host: string;
  port: number;
  privateKeyPath: string;
  address: string; // host:port
}

export function getClusterLoginNode(cluster: string): ClusterLoginNode | undefined {

  if (
    clusters[cluster] === undefined ||
    clusters[cluster].slurm === undefined ||
    clusters[cluster].slurm.loginNodes === undefined ||
    clusters[cluster].slurm.loginNodes.length === 0
  ) {
    return undefined;
  }
  const loginNodes = clusters[cluster]?.slurm?.loginNodes?.[0];

  if (typeof loginNodes === "string") {
    const [host, port] = loginNodes.indexOf(":") ? loginNodes.split(":") : [loginNodes, "22"];
    return {
      host,
      port: parseInt(port, 10),
      privateKeyPath: "~/.ssh/id_rsa",
      address: loginNodes,
    };
  }
  else {
    return {
      host: loginNodes.host,
      port: loginNodes.port!,
      privateKeyPath: loginNodes.privateKeyPath!,
      address: `${loginNodes.host}:${loginNodes.port}`,
    };
  }

}
