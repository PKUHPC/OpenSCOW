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
export type BlockAccountReply =
  | { code: "NOT_FOUND"}
  | { code: "OK", executed: boolean };

export interface UnblockAccountRequest {
  accountName: string;
}

/** NOT_FOUND: account is not found. */
export type UnblockAccountReply =
  | { code: "NOT_FOUND"}
  | { code: "OK"; executed: boolean };

export interface AccountOps {
  deleteAccount(req: Request<DeleteAccountRequest>): Promise<DeleteAccountReply>;
  createAccount(req: Request<CreateAccountRequest>): Promise<CreateAccountReply>;
  blockAccount(req: Request<BlockAccountRequest>): Promise<BlockAccountReply>;
  unblockAccount(req: Request<UnblockAccountRequest>): Promise<UnblockAccountReply>;

}

