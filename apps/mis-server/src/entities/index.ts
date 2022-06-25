import { Account } from "src/entities/Account";
import { AccountWhitelist } from "src/entities/AccountWhitelist";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { JobInfo } from "src/entities/JobInfo";
import { JobPriceChange } from "src/entities/JobPriceChange";
import { JobPriceItem } from "src/entities/JobPriceItem";
import { PayRecord } from "src/entities/PayRecord";
import { StorageQuota } from "src/entities/StorageQuota";
import { SystemState } from "src/entities/SystemState";
import { Tenant } from "src/entities/Tenant";
import { User } from "src/entities/User";
import { UserAccount } from "src/entities/UserAccount";

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
];
