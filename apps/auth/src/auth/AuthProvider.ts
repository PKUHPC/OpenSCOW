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

export interface AuthProvider {
  serveLoginHtml: (callbackUrl: string, req: FastifyRequest, rep: FastifyReply) => Promise<void>;
  fetchAuthTokenInfo: (token: string, req: FastifyRequest) => Promise<string | undefined>;
  getUser: undefined | ((identityId: string, req: FastifyRequest) => Promise<{ identityId: string } | undefined>);
  createUser: undefined | ((info: CreateUserInfo, req: FastifyRequest) => Promise<CreateUserResult>);
  validateName: undefined | ((identityId: string, name: string, req: FastifyRequest) => Promise<ValidateNameResult>);
  changePassword: undefined | ((id: string, oldPassword: string, newPassword: string,
    req: FastifyRequest) => Promise<ChangePasswordResult>);
}
