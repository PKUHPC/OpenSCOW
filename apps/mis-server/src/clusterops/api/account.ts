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

export interface CreateAccountRequest {
  accountName: string;
  ownerId: string;
}

export type CreateAccountReply =
  | { code: "ALREADY_EXISTS"}
  | { code: "OK" };

export interface DeleteAccountRequest {
  accountName: string;
}

export type DeleteAccountReply =
  | { code: "NOT_FOUND"}
  | { code: "OK" };


export interface BlockAccountRequest {
  accountName: string;
}

/** NOT_FOUND: account is not found. */
export type BlockAccountReply = {
  code: "OK" | "NOT_FOUND" | "ALREADY_BLOCKED";
};

export interface UnblockAccountRequest {
  accountName: string;
}

/** NOT_FOUND: account is not found. */
export type UnblockAccountReply = {
  code: "OK" | "NOT_FOUND" | "ALREADY_UNBLOCKED"
};

export interface AccountOps {
  deleteAccount(req: Request<DeleteAccountRequest>): Promise<DeleteAccountReply>;
  createAccount(req: Request<CreateAccountRequest>): Promise<CreateAccountReply>;
  blockAccount(req: Request<BlockAccountRequest>): Promise<BlockAccountReply>;
  unblockAccount(req: Request<UnblockAccountRequest>): Promise<UnblockAccountReply>;

}

