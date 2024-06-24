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

import { Status } from "@grpc/grpc-js/build/src/constants";

export function httpStatusToGrpcCode(httpStatus: number): Status {
  switch (httpStatus) {
  case 200:
    return Status.OK;
  case 400:
    return Status.INVALID_ARGUMENT;
  case 401:
    return Status.UNAUTHENTICATED;
  case 403:
    return Status.PERMISSION_DENIED;
  case 404:
    return Status.NOT_FOUND;
  case 409:
    return Status.ALREADY_EXISTS;
  case 429:
    return Status.RESOURCE_EXHAUSTED;
  case 499:
    return Status.CANCELLED;
  case 500:
    return Status.INTERNAL;
  case 501:
    return Status.UNIMPLEMENTED;
  case 503:
    return Status.UNAVAILABLE;
  case 504:
    return Status.DEADLINE_EXCEEDED;
  default:
    return Status.UNKNOWN;
  }
}