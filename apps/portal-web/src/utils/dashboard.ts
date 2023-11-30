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

import { I18nStringType } from "@scow/config/build/i18n";
import { Entry } from "src/models/dashboard";

import { publicConfig } from "./config";

export const formatEntryId = (item: Entry) => {
  let id: string = item.id;
  if (item.entry?.$case === "app") {
    id = id + "-" + item.entry.app.clusterId;
  }
  else if (item.entry?.$case === "shell") {
    id = id + "-" + item.entry.shell.clusterId;
  }
  return id;
};

export const getEntryIcon = (item: Entry) => {
  let icon: string = "";

  if (item.entry?.$case === "pageLink") {
    icon = item.entry.pageLink.icon;
  }
  else if (item.entry?.$case === "shell") {
    icon = item.entry.shell.icon;
  }
  return icon;
};

export const getEntryClusterName = (item: Entry) => {
  const clusters = publicConfig.CLUSTERS;
  let clusterName: I18nStringType | undefined = "";

  if (item.entry?.$case === "shell") {
    const clusterId = item.entry.shell.clusterId;
    clusterName = clusters.find((x) => x.id === clusterId)?.name;
  }
  else if (item.entry?.$case === "app") {
    const clusterId = item.entry.app.clusterId;
    clusterName = clusters.find((x) => x.id === clusterId)?.name;
  }

  return clusterName;
};
