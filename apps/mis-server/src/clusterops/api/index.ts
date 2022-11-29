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
  onStartup: () => Promise<void>;
}