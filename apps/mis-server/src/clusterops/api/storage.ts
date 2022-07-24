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
