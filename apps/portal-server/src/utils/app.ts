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

import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/src/constants";
import { join } from "path";
import { getAppConfigs } from "src/config/apps";

export function splitSbatchArgs(sbatchArgs: string) {
  const args = sbatchArgs.split(" -").map(function(x, index) {
    x = x.trim();
    return index === 0 ? x : "-" + x;
  });
  return args.filter((x) => x); // remove empty string in the array
}


export const getClusterAppConfigs = (cluster: string) => {

  const apps = getAppConfigs();

  const clusterAppsConfigs = getAppConfigs(join(DEFAULT_CONFIG_BASE_PATH, "clusters/", cluster));

  const clusterApps = {};

  for (const [key, value] of Object.entries(clusterAppsConfigs)) {
    clusterApps[key] = value;
  }

  for (const [key, value] of Object.entries(apps)) {
    if (!(key in clusterApps)) {
      clusterApps[key] = value;
    }
  }

  return { apps, clusterApps };

};
