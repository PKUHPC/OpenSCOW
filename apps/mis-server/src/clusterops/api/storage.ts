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

import { Request } from "src/clusterops/api";

export enum ChangeStorageQuotaMode {
  INCREASE = 0,
  DECREASE = 1,
  SET = 2,
}

export interface ChangeStorageQuotaRequest {
  userId: string;
  mode: ChangeStorageQuotaMode;
  value: number;
}

export type ChangeStorageQuotaReply = 
  | { code: "NOT_FOUND"} // the user is not found
  | { code: "INVALID_VALUE" } // the value is not valid
  | { code: "OK", currentQuota: number; }

export interface QueryUsedStorageQuotaRequest {
  userId: string;
}

export type QueryUsedStorageQuotaReply =
  | { code: "NOT_FOUND"} // the user is not found
  | { code: "OK", used: number }; // unit: byte

export interface StorageOps {
  changeStorageQuota(req: Request<ChangeStorageQuotaRequest>): Promise<ChangeStorageQuotaReply>;
  queryUsedStorageQuota(req: Request<QueryUsedStorageQuotaRequest>): Promise<QueryUsedStorageQuotaReply>;
}
