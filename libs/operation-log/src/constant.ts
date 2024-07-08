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

import { OperationLog } from "@scow/protos/build/audit/operation_log";

export enum OperationResult {
  UNKNOWN = 0,
  SUCCESS = 1,
  FAIL = 2,
};

type ExtractCases<T> = T extends { $case: infer U } ? U : never;

export type OperationType = ExtractCases<OperationLog["operationEvent"]>;

export type OperationTypeEnum = {[K in OperationType]: K };
