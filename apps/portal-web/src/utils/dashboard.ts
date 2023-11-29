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

import { Entry } from "src/models/User";

export const formatEntryId = (item: Entry) => {
  let id: string | undefined = item.id;
  if (item.entry?.$case === "app") {
    id = id + "-" + item.entry.app.cluster?.id;
  }
  else if (item.entry?.$case === "shell") {
    id = id + "-" + item.entry.shell.cluster?.id;
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
  let clusterName: string | undefined = "";

  if (item.entry?.$case === "shell") {
    clusterName = item.entry.shell.cluster?.name;
  }
  else if (item.entry?.$case === "app") {
    clusterName = item.entry.app.cluster?.name;
  }
  return clusterName;
};
