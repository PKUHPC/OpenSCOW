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

import { ClusterAccountInfo, ClusterAccountInfo_ImportStatus, GetClusterUsersResponse,
  UserInAccount } from "@scow/protos/build/server/admin";

// Parses slurm.sh output to GetClusterUsersResponse
// Accounts with no user are not included
export function parseClusterUsers(dataStr: string): GetClusterUsersResponse {
  const obj: GetClusterUsersResponse = {
    accounts:[] as ClusterAccountInfo[],
  };

  if (dataStr.trim() === "") { return obj; }

  const lines = dataStr.trim().split("\n");
  lines.push("");

  let i = 0;
  while (i < lines.length - 1) {
    const account = lines[i].trim();
    const accountIndex = obj.accounts.push({
      accountName: account,
      users: [] as UserInAccount[],
      importStatus: ClusterAccountInfo_ImportStatus.NOT_EXISTING,
    });
    i++;
    while (i < lines.length && lines[i].trim() !== "") {
      if (lines[i].trim().startsWith("There is no user in account")) {
        obj.accounts.pop();
        break;
      }
      const [user, status] = lines[i].split(":").map((x) => x.trim());
      if (account === "a_" + user && obj.accounts[accountIndex - 1].owner === undefined) {
        obj.accounts[accountIndex - 1].owner = user;
      }
      obj.accounts[accountIndex - 1].users.push({ userId: user, userName: user, state: status });
      i++;
    }
    i++;
  }

  return obj;
}
