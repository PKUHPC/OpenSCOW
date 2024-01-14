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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getSchedulerAdapterClient, SchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { parseErrorDetails } from "@scow/rich-error-model";
import { ApiVersion } from "@scow/utils/build/version";
import { clusters } from "src/server/config/clusters";

const adapterClientForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  const client = getSchedulerAdapterClient(c.adapterUrl);
  prev[cluster] = client;
  return prev;
}, {} as Record<string, SchedulerAdapterClient>);

export const getAdapterClient = (cluster: string) => {
  return adapterClientForClusters[cluster];
};

// 试试提取到libs/server下
/**
 * 判断当前集群下的调度器API版本对比传入的接口是否已过时
 * @param client
 * @param minVersion
 */
export async function checkSchedulerApiVersion(client: SchedulerAdapterClient,
  minVersion: ApiVersion): Promise<void> {

  let scheduleApiVersion: ApiVersion | null;
  try {
    scheduleApiVersion = await asyncClientCall(client.version, "getVersion", {});
  } catch (e) {
    const ex = e as ServiceError;
    const errors = parseErrorDetails(ex.metadata);
    // 如果找不到获取版本号的接口，指定版本为接口存在前的最新版1.0.0
    if (((e as any).code === status.UNIMPLEMENTED) ||
    (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "UNIMPLEMENTED")) {
      scheduleApiVersion = { major: 1, minor: 0, patch: 0 };
    } else {
      throw <ServiceError> {
        code: Status.UNIMPLEMENTED,
        message: "unimplemented",
        details: "The scheduler API version can not be confirmed."
          + "To use this method, the scheduler adapter must be upgraded to the version "
          + `${minVersion.major}.${minVersion.minor}.${minVersion.patch} `
          + "or higher.",
      };
    }
  }

  if (scheduleApiVersion) {

    // 检查调度器接口版本是否大于等于最低要求版本
    let geMinVersion: boolean;
    if (scheduleApiVersion.major !== minVersion.major) {
      geMinVersion = (scheduleApiVersion.major > minVersion.major);
    } else if (scheduleApiVersion.minor !== minVersion.minor) {
      geMinVersion = (scheduleApiVersion.minor > minVersion.minor);
    } else {
      geMinVersion = true;
    }

    if (!geMinVersion) {
      throw <ServiceError> {
        code: Status.FAILED_PRECONDITION,
        message: "precondition failed",
        details: "The method is not supported with the current scheduler adapter version. "
          + "To use this method, the scheduler adapter must be upgraded to the version "
          + `${minVersion.major}.${minVersion.minor}.${minVersion.patch} `
          + "or higher.",
      };
    }
  }

};
