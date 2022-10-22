import { Logger } from "@ddadaal/tsgrpc-server";
import { AccountOps } from "src/clusterops/api/account";
import { JobOps } from "src/clusterops/api/job";
import { StorageOps } from "src/clusterops/api/storage";
import { UserOps } from "src/clusterops/api/user";

export interface Request<T> {
  request: T; 
  logger: Logger;
}

export interface ClusterOps {
  account: AccountOps;
  job: JobOps;
  storage: StorageOps;
  user: UserOps;
  onStartup : () => Promise<void>;
}