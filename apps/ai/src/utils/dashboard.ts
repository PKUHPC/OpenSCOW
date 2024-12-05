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

import { Cluster } from "@scow/config/build/type";
import { Entry } from "@scow/protos/build/portal/dashboard";
import { SortOrder } from "antd/lib/table/interface";

export const formatEntryId = (item: Entry) => {

  if (item.entry?.$case === "app") {
    return `${item.id}-${item.entry.app.clusterId}`;
  }

  else if (item.entry?.$case === "shell") {
    return `${item.id}-${item.entry.shell.clusterId}`;
  }

  return item.id;
};

export const getEntryIcon = (item: Entry) => {

  if (item.entry?.$case === "pageLink") {
    return item.entry.pageLink.icon;
  }

  else if (item.entry?.$case === "shell") {
    return item.entry.shell.icon;
  }
  return undefined;
};



export const getEntryClusterName = (item: Entry["entry"] & { $case: "app" | "shell" }
  , publicConfigClusters: Cluster[]) => {
  const clusters = publicConfigClusters;

  if (item.$case === "shell") {
    const clusterId = item.shell.clusterId;
    return clusters.find((x) => x.id === clusterId)?.name;
  }

  const clusterId = item.app.clusterId;
  return clusters.find((x) => x.id === clusterId)?.name;

};



export const compareWithUndefined = <T extends number | string | undefined>
(a: T, b: T, sortOrder?: SortOrder): number => {
  if (a === undefined && b === undefined) {
    // 两者均为 undefined，视为相等
    return 0;
  }
  else if (a === undefined) {
    // a 为 undefined，b 不为 undefined，将 a 排在后面
    return sortOrder === "ascend" || !sortOrder ? 1 : -1;
  }
  else if (b === undefined) {
    // b 为 undefined，a 不为 undefined，将 b 排在后面
    return sortOrder === "ascend" || !sortOrder ? -1 : 1;
  }

  // 都不为 undefined 时，正常比较
  return typeof a === "number" && typeof b === "number" ? a - b :
    typeof a === "string" && typeof b === "string" ? a.localeCompare(b) :
      0;
};
