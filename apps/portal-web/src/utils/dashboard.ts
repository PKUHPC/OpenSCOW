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

import { Entry } from "@scow/protos/build/portal/dashboard";
import { useI18nTranslateToString } from "src/i18n";
import { AppWithCluster } from "src/pageComponents/dashboard/QuickEntry";

import { publicConfig } from "./config";


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

export const entryNameMap = {
  submitJob:"routes.job.submitJob",
  runningJobs:"routes.job.runningJobs",
  allJobs:"routes.job.allJobs",
  savedJobs:"routes.job.jobTemplates",
  desktop:"routes.desktop",
} as const;

export const getEntryName = (item: Entry) => {
  const t = useI18nTranslateToString();

  if (item.entry?.$case === "pageLink" && entryNameMap[item.name]) {

    return t(entryNameMap[item.name]);
  }

  return item.name;
};

export const getEntryClusterName = (item: Entry & {entry: {$case: "app" | "shell"} }) => {
  const clusters = publicConfig.CLUSTERS;

  if (item.entry) {
    if (item.entry.$case === "shell") {
      const clusterId = item.entry.shell.clusterId;
      return clusters.find((x) => x.id === clusterId)?.name;
    }

    else if (item.entry.$case === "app") {
      const clusterId = item.entry.app.clusterId;
      return clusters.find((x) => x.id === clusterId)?.name;
    }
  }
  return undefined;
};

export const getEntryLogoPath = (item: Entry, apps: AppWithCluster) => {

  const appId = item.id.split("-")[0];

  if (item.entry?.$case === "app" && apps[appId]) {
    return apps[appId].app.logoPath;
  }

  return undefined;
};
