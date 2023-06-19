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

import { Metadata, status, StatusObject } from "@grpc/grpc-js";
import { encodeErrorDetails, ErrorDetail } from "src/errorDetail";

import { Status } from "./generated/status";

export class DetailedError extends Error implements StatusObject {

  code: status;
  details: string;
  metadata: Metadata;

  constructor(
    error: {
      code: status,
      message: string,
      details: ErrorDetail[],
    },
    options?: ErrorOptions,
  ) {
    super(error.message, options);
    this.code = error.code;
    this.details = error.message;

    const status = Status.fromPartial({
      code: error.code,
      message: error.message,
      details: encodeErrorDetails(error.details),
    });

    this.metadata = new Metadata();
    this.metadata.set("grpc-status-details-bin", Buffer.from(Status.encode(status).finish()));
  }
}

