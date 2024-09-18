/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { JobInfo } from "src/entities/JobInfo";
import { JobPriceChange } from "src/entities/JobPriceChange";
import { JobPriceItem } from "src/entities/JobPriceItem";
import { PayRecord } from "src/entities/PayRecord";
import { QueryCache } from "src/entities/QueryCache";
import { StorageQuota } from "src/entities/StorageQuota";
import { SystemState } from "src/entities/SystemState";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount } from "src/entities/UserAccount";

import { Cluster } from "./Cluster";

export const entities = [
  UserAccount,
  AccountWhitelist,
  User,
  StorageQuota,
  Account,
  Tenant,
  JobInfo,
  JobPriceChange,
  JobPriceItem,
  PayRecord,
  ChargeRecord,
  SystemState,
  QueryCache,
  Cluster,
];
