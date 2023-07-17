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

export const clusterNotFound = (cluster: string) => {
  return <ServiceError> { code: Status.NOT_FOUND, message: `cluster ${cluster} is not found` };
};

export const jobNotFound = (jobId: number) => {
  return <ServiceError> { code: Status.NOT_FOUND, message: `job id ${jobId} is not found` };
};

export const loginNodeNotFound = (loginNode: string) => {
  return <ServiceError>{ code: Status.NOT_FOUND, message: `login node ${loginNode} is not found` };
};
