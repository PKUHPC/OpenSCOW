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
