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
import { ApiVersion, compareSemVersion } from "@scow/utils/build/version";
import { clusters } from "src/config/clusters";

import { logger } from "./logger";

const adapterClientForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
  const client = getSchedulerAdapterClient(c.adapterUrl);
  prev[cluster] = client;
  return prev;
}, {} as Record<string, SchedulerAdapterClient>);

export const getAdapterClient = (cluster: string) => {
  return adapterClientForClusters[cluster];
};


// /**
//  * 判断当前集群下的API版本与调度器API版本
//  * @param client
//  * @returns
//  */
// export async function checkScowSchedulerApiVersion(client: SchedulerAdapterClient): Promise<void> {

//   let scheduleApiVersion: ApiVersion | null;
//   try {
//     scheduleApiVersion = await asyncClientCall(client.version, "getVersion", {});
//   } catch (e) {
//     const ex = e as ServiceError;
//     const errors = parseErrorDetails(ex.metadata);
//     // 如果接口不存在
//     if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "UNIMPLEMENTED") {
//       scheduleApiVersion = { major: 1, minor: 1, patch: 0 };
//     // 如果接口服务不存在
//     } else if ((e as any).code === status.UNIMPLEMENTED) {
//       scheduleApiVersion = { major: 1, minor: 1, patch: 0 };
//     } else {
//       scheduleApiVersion = null;
//       logger.warn(
//         "The scheduler API version can not be confirmed. Some functionalities may not operate as expected.");
//     }
//   }
//   const scowSchedulerApiVersion = getCurrentScowSchedulerApiVersion();

//   if (!scowSchedulerApiVersion && scheduleApiVersion) {
//     logger.warn("The current scow scheduler API version can not be confirmed. Please ensure you are using "
//     + "an API version that is compatible with the scheduler Api Version "
//     + `${scheduleApiVersion.major}.${scheduleApiVersion.minor}.${scheduleApiVersion.patch}.`);
//   }

//   if (scowSchedulerApiVersion && scheduleApiVersion) {
//     const compareResult = compareSemVersion(scowSchedulerApiVersion, scheduleApiVersion);
//     if (compareResult === 1) {
//       logger.warn("The current scheduler API version is outdated. Some functionalities may not operate as expected. "
//       + "Please upgrade to version "
//       +
//      `${scowSchedulerApiVersion.major}.${scowSchedulerApiVersion.minor}.${scowSchedulerApiVersion.patch} or later.`);
//     }
//   }

// };




/**
 * 判断当前集群下的调度器API版本对比传入的接口是否已过时
 * @param client
 * @param comparedVersion
 */
export async function checkSchedulerApiVersion(client: SchedulerAdapterClient,
  comparedVersion: ApiVersion): Promise<void> {

  let scheduleApiVersion: ApiVersion | null;
  try {
    scheduleApiVersion = await asyncClientCall(client.version, "getVersion", {});
  } catch (e) {
    const ex = e as ServiceError;
    const errors = parseErrorDetails(ex.metadata);
    // 如果接口不存在
    if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo" && errors[0].reason === "UNIMPLEMENTED") {
      scheduleApiVersion = { major: 1, minor: 1, patch: 0 };
    // 如果接口服务不存在
    } else if ((e as any).code === status.UNIMPLEMENTED) {
      scheduleApiVersion = { major: 1, minor: 1, patch: 0 };
    } else {
      scheduleApiVersion = null;
      logger.warn(
        "The scheduler API version can not be confirmed. Some functionalities may not operate as expected.");
    }
  }

  if (scheduleApiVersion) {
    const compareResult = compareSemVersion(comparedVersion, scheduleApiVersion);
    if (compareResult === 1) {
      throw <ServiceError> {
        code: Status.FAILED_PRECONDITION,
        message: "precondition failed",
        details: "The method is not supported with the current scheduler adapter version. "
          + "To use this method, the scheduler adapter must be upgraded to the version "
          + `${comparedVersion.major}.${comparedVersion.minor}.${comparedVersion.patch}`
          + "or higher.",
      };
    }
  }

};
