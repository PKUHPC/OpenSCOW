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

import { Decimal } from "@scow/lib-decimal";
import { AccountState } from "src/entities/Account";


export enum DisplayedAccountState {
  DISPLAYED_FROZEN = 0,
  DISPLAYED_BLOCKED = 1,
  DISPLAYED_BELOW_BLOCK_THRESHOLD = 2,
  DISPLAYED_NORMAL = 3,
}

export interface AccountStateInfo {
  displayedState: DisplayedAccountState,
  shouldBlockInCluster: boolean,
}

/**
 *
 * @param whitelist
 * @param state
 * @param balance
 * @param thresholdAmount
 * @returns
 */
export const getAccountStateInfo = (
  whitelistId: number | undefined,
  state: AccountState,
  balance: Decimal,
  thresholdAmount: Decimal): AccountStateInfo => {

  if (state === AccountState.FROZEN) {
    return {
      displayedState: DisplayedAccountState.DISPLAYED_FROZEN,
      shouldBlockInCluster: true,
    };
  }

  if (whitelistId) {
    return {
      displayedState: DisplayedAccountState.DISPLAYED_NORMAL,
      shouldBlockInCluster: false,
    };
  }

  if (state === AccountState.BLOCKED_BY_ADMIN) {
    return {
      displayedState: DisplayedAccountState.DISPLAYED_BLOCKED,
      shouldBlockInCluster: true,
    };
  }

  return balance.lte(thresholdAmount) ?
    {
      displayedState: DisplayedAccountState.DISPLAYED_BELOW_BLOCK_THRESHOLD,
      shouldBlockInCluster: true,
    } : {
      displayedState: DisplayedAccountState.DISPLAYED_NORMAL,
      shouldBlockInCluster: false,
    };
};

