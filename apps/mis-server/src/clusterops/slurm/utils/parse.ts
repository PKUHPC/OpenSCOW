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

import { ClusterAccountInfo, ClusterAccountInfo_ImportStatus,
  UserInAccount } from "@scow/protos/build/server/admin";

// Parses slurm.sh output
// Accounts with no user are not included
export function parseClusterAccounts(dataStr: string): ClusterAccountInfo[] {

  const accounts: ClusterAccountInfo[] = [];

  if (dataStr.trim() === "") { return accounts; }

  const lines = dataStr.trim().split("\n");
  lines.push("");

  let i = 0;
  while (i < lines.length - 1) {
    const account = lines[i].trim();
    const accountIndex = accounts.push({
      accountName: account,
      users: [] as UserInAccount[],
      importStatus: ClusterAccountInfo_ImportStatus.NOT_EXISTING,
      blocked: true,
    });
    i++;
    while (i < lines.length && lines[i].trim() !== "") {
      if (lines[i].trim().startsWith("There is no user in account")) {
        accounts.pop();
        break;
      }
      const [user, status] = lines[i].split(":").map((x) => x.trim());
      if (account === "a_" + user && accounts[accountIndex - 1].owner === undefined) {
        accounts[accountIndex - 1].owner = user;
      }
      accounts[accountIndex - 1].users.push({ userId: user, userName: user, state: status });
      i++;
    }
    i++;
  }

  return accounts;
}

export function parseBlockStatus(dataStr: string): Record<string, boolean> {
  const lines = dataStr.split("\n");
  const result: Record<string, boolean> = {};

  for (const line of lines) {
    const match = line.match(/^Account (\S+) is (allowed|blocked)!$/);
    if (match) {
      const accountName = match[1];
      const isBlocked = match[2] === "blocked";
      result[accountName] = isBlocked;
    }
  }

  return result;
}
