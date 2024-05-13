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

import { AccountOfTenantTarget, AccountsOfAllTenantsTarget,
  AccountsOfTenantTarget, AllTenantsTarget,
  TenantTarget } from "@scow/protos/build/server/charging";
import { misConfig } from "src/config/mis";

import { CHARGE_TYPE_OTHERS } from "./constants";
/**
 * generate charge records' search param of target
 *
 * @param target
 * case tenant:返回这个租户（tenantName）的消费记录
 * case allTenants: 返回所有租户消费记录
 * case accountOfTenant: 返回这个租户（tenantName）下这个账户（accountName）的消费记录
 * case accountsOfTenant: 返回这个租户（tenantName）下任意多个账户的消费记录
 * case accountsOfAllTenants: 返回所有租户下多个账户的消费记录
 *
 */
export const getChargesTargetSearchParam = (
  target:
  | { $case: "accountOfTenant"; accountOfTenant: AccountOfTenantTarget }
  | { $case: "accountsOfTenant"; accountsOfTenant: AccountsOfTenantTarget }
  | { $case: "accountsOfAllTenants"; accountsOfAllTenants: AccountsOfAllTenantsTarget }
  | { $case: "tenant"; tenant: TenantTarget }
  | { $case: "allTenants"; allTenants: AllTenantsTarget }
  | undefined,
): { tenantName?: string | { $ne: null }, accountName?: string | { $ne: null } | { $in: string[] } } => {

  let searchParam: { tenantName?: string | { $ne: null },
  accountName?: string | { $ne: null } | { $in: string[] } } = {};
  switch (target?.$case)
  {
  // 当前租户的租户消费记录
  case "tenant":
    searchParam = { tenantName: target[target.$case].tenantName, accountName: undefined };
    break;
  // 所有租户的租户消费记录
  case "allTenants":
    searchParam = { tenantName: { $ne:null }, accountName: undefined };
    break;
  // 当前租户下当前账户的消费记录
  case "accountOfTenant":
    searchParam = { tenantName: target[target.$case].tenantName, accountName: target[target.$case].accountName };
    break;
  // 当前租户下多个账户的消费记录
  case "accountsOfTenant":
    {
      const { accountNames } = target.accountsOfTenant;
      searchParam = { tenantName: target[target.$case].tenantName,
        accountName:accountNames.length ? { $in: accountNames } : { $ne:null } };
      break;
    } ;
  // 所有租户下多个账户的消费记录
  case "accountsOfAllTenants":
    {
      const { accountNames } = target.accountsOfAllTenants;
      searchParam = { tenantName: { $ne: null }, accountName:accountNames.length ?
        { $in: accountNames } : { $ne:null } };
      break;
    };
  default:
    searchParam = {};
  }
  return searchParam;
};

/**
 * generate charge records' search type
 */
export const getChargesSearchType = (type: string | undefined) => {
  const typesToSearch = [
    misConfig.jobChargeType,
    misConfig.changeJobPriceType,
    ...(misConfig.customChargeTypes || []),
  ];

  let searchType = {};
  if (!type) {
    searchType = { type: { $ne: null } };
  } else {
    if (type === CHARGE_TYPE_OTHERS) {
      searchType = { type: { $nin: typesToSearch } };
    } else {
      searchType = { type: type };
    }
  }

  return searchType;
};

export const getChargesSearchTypes = (types: string[] | undefined) => {
  if (!types?.length) {
    return { type: { $ne: null } };
  }

  return { type:{ $in:types } };
};

/**
 *
 * @param target
 * case tenant:返回这个租户（tenantName）的充值记录
 * case allTenants: 返回所有租户充值记录
 * case accountsOfTenant: 返回这个租户（tenantName）下多个账户的充值记录
 */

export const getPaymentsTargetSearchParam = (target:
| { $case: "accountOfTenant";accountOfTenant: AccountOfTenantTarget; }
| { $case: "accountsOfTenant"; accountsOfTenant: AccountsOfTenantTarget }
| { $case: "tenant"; tenant: TenantTarget }
| { $case: "allTenants"; allTenants: AllTenantsTarget }):
 { tenantName?: string | { $ne: null }, accountName?: { $in: string[] } | string | { $ne: null }} => {

  let searchParam: { tenantName?: string | { $ne: null },
   accountName?: { $in: string[] } | string | { $ne: null }} = {};
  const { accountNames, tenantName } = target[target.$case];
  switch (target?.$case)
  {
  case "tenant":
    searchParam = { tenantName, accountName:undefined };
    break;
  case "allTenants":
    searchParam = { accountName:undefined };
    break;
  case "accountsOfTenant":
    const accountName = accountNames.length === 0 ? { $ne:null } : { $in:accountNames };
    searchParam = { tenantName, accountName };
    break;
  default:
    break;
  }
  return searchParam;
};

/**
 * generate payment search type
 */
export const getPaymentsSearchType = (types: string[] | undefined) => {
  if (!types?.length) {
    return { type: { $ne: null } };
  }

  return { type:{ $in:types } };
};
