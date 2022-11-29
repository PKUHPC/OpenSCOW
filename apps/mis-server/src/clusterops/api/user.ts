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

export interface BlockUserInAccountRequest {
  userId: string;
  accountName: string;
}

/** NOT_FOUND: user is not found. */
export interface BlockUserInAccountReply {}

export interface UnblockUserInAccountRequest {
  userId: string;
  accountName: string;
}

/** NOT_FOUND: user is not found. */
export interface UnblockUserInAccountReply {}

export interface RemoveUserRequest {
  userId: string;
  accountName: string;
}

/** NOT_FOUND: user is not found. */
export interface RemoveUserReply {}

export interface AddUserRequest {
  userId: string;
  accountName: string;
}

/** ALREADY_EXISTS: User already exists. */
export interface AddUserReply {}

export interface GetAllUsersInAccountsRequest {}

export interface GetAllUsersInAccountsReply {
  result: string;
}

export interface UserOps {
  addUser(req: Request<AddUserRequest>): Promise<AddUserReply>;
  removeUser(req: Request<RemoveUserRequest>): Promise<RemoveUserReply>;
  blockUserInAccount(req: Request<BlockUserInAccountRequest>): Promise<BlockUserInAccountReply>;
  unblockUserInAccount(req: Request<UnblockUserInAccountRequest>): Promise<UnblockUserInAccountReply>;
  getAllUsersInAccounts(req: Request<GetAllUsersInAccountsRequest>): Promise<GetAllUsersInAccountsReply>;
}
