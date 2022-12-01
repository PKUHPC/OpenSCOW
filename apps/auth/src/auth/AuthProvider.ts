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

import type { FastifyReply, FastifyRequest } from "fastify";

export type ValidationResult = "" | string;

export interface CreateUserInfo {
  mail: string;
  id: number;
  identityId: string;
  name: string;
  password: string;
}

export type ValidateNameResult = "NotFound" | "Match" | "NotMatch";
export type CreateUserResult = "AlreadyExists" | "OK";
export type ChangePasswordResult = "NotFound" | "WrongOldPassword" | "OK";
export type CheckPasswordResult = "NotFound" | "Match" | "NotMatch";

export interface AuthProvider {
  serveLoginHtml: (callbackUrl: string, req: FastifyRequest, rep: FastifyReply) => Promise<void>;
  fetchAuthTokenInfo: (token: string, req: FastifyRequest) => Promise<string | undefined>;
  getUser: undefined | ((identityId: string, req: FastifyRequest) => Promise<{ identityId: string } | undefined>);
  createUser: undefined | ((info: CreateUserInfo, req: FastifyRequest) => Promise<CreateUserResult>);
  validateName: undefined | ((identityId: string, name: string, req: FastifyRequest) => Promise<ValidateNameResult>);
  changePassword: undefined | ((id: string, oldPassword: string, newPassword: string,
    req: FastifyRequest) => Promise<ChangePasswordResult>);
  checkPassword: undefined | ((identityId: string, password: string, 
    req: FastifyRequest) => Promise<CheckPasswordResult>);
}
