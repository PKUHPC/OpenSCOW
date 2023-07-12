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

import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getClusterConfigs } from "@scow/config/build/cluster";
import { getPortalConfig } from "@scow/config/build/portal";

export function getAvailableWms(cluster: string) {

  const commonAvailableWms = getPortalConfig().loginDesktop.wms;

  const clusterAvailableWms = getClusterConfigs()[cluster].loginDesktop?.wms;

  return clusterAvailableWms || commonAvailableWms;
}

export function ensureEnabled(cluster: string) {
  const commonEnabled = getPortalConfig().loginDesktop.enabled;

  const clusterEnabled = getClusterConfigs()[cluster].loginDesktop?.enabled;

  if (clusterEnabled === false || clusterEnabled === undefined && commonEnabled === false) {
    throw <ServiceError>{ code: Status.UNAVAILABLE, message: "Login deskto is not enabled" };
  }
}
