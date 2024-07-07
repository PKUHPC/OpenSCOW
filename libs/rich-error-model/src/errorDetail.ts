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

import {
  BadRequest,
  BadRequest_FieldViolation,
  DebugInfo,
  ErrorInfo,
  Help,
  LocalizedMessage,
  PreconditionFailure,
  PreconditionFailure_Violation,
  QuotaFailure,
  QuotaFailure_Violation,
  ResourceInfo,
  RetryInfo,
} from "src/generated/error_details";
import { Any } from "src/generated/google/protobuf/any";

export const KnownMessages = [
  BadRequest,
  BadRequest_FieldViolation,
  DebugInfo,
  ErrorInfo,
  Help,
  LocalizedMessage,
  PreconditionFailure,
  PreconditionFailure_Violation,
  QuotaFailure,
  QuotaFailure_Violation,
  ResourceInfo,
  RetryInfo,
] as const;

export type ErrorDetail =
  | BadRequest
  | BadRequest_FieldViolation
  | DebugInfo
  | ErrorInfo
  | Help
  | LocalizedMessage
  | PreconditionFailure
  | PreconditionFailure_Violation
  | QuotaFailure
  | QuotaFailure_Violation
  | ResourceInfo
  | RetryInfo
  | Any;

export {
  BadRequest,
  BadRequest_FieldViolation,
  DebugInfo,
  ErrorInfo,
  Help,
  LocalizedMessage,
  PreconditionFailure,
  PreconditionFailure_Violation,
  QuotaFailure,
  QuotaFailure_Violation,
  ResourceInfo,
  RetryInfo,
};

export function decodeErrorDetails(details: Any[]): ErrorDetail[] {
  return details.map((value) => {
    const messageType = KnownMessages.find((type) =>
      value.typeUrl.endsWith(`/${type.$type}`),
    );

    if (messageType == null) {
      return value;
    }

    return messageType.decode(value.value);
  });
}

export function encodeErrorDetails(details: ErrorDetail[]): Any[] {
  return details.map((value) => {
    if (value.$type === Any.$type) {
      return value;
    }

    const messageType = KnownMessages.find((type) => type.$type === value.$type);

    if (messageType == null) {
      throw new Error(`Unknown error details type: ${value.$type}`);
    }

    return Any.fromPartial({
      typeUrl: `type.googleapis.com/${value.$type}`,
      value: messageType.encode(value as any).finish(),
    });
  });
}

export const errorDetailsToJson = (details: ErrorDetail[]) => {
  return {
    errors: details.map((value) => {
      const messageType = KnownMessages.find((type) => type.$type === value.$type);
      return messageType ? messageType.toJSON(value as any) : value;
    }),
  };
};
