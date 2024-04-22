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

import { I18nStringType } from "./i18n";

export type Cluster = { id: string; name: I18nStringType; }

export enum ClusterOnlineStatus {
  ONLINE = 0,
  OFFLINE = 1,
}

export type ClusterOnlineInfo = {
  comment?: string | undefined;
  operatorId?: string | undefined;
  operatorName?: string | undefined;
  clusterId: string;
  onlineStatus: ClusterOnlineStatus;
}
