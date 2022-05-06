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
export type CreateUserResult = "NotImplemented" | "AlreadyExists" | "OK";
export type ChangePasswordResult = "NotImplemented" | "NotFound" | "WrongOldPassword" | "OK";

export interface AuthProvider {
  serveLoginHtml: (callbackUrl: string, req: FastifyRequest, rep: FastifyReply) => Promise<void>;
  fetchAuthTokenInfo: (token: string, req: FastifyRequest) => Promise<string | undefined>;
  validateName: (identityId: string, name: string, req: FastifyRequest) => Promise<ValidateNameResult>;
  createUser: (info: CreateUserInfo, req: FastifyRequest) => Promise<CreateUserResult>;
  changePassword: (id: string, oldPassword: string, newPassword: string,
    req: FastifyRequest) => Promise<ChangePasswordResult>;
}
