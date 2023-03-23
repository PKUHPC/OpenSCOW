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

import { ImportState } from "@scow/protos/build/server/admin";
import { parseClusterUsers } from "src/utils/slurm";


const dataStr = `
a_user1
user1 : allowed!
user2 : blocked!

a_t2
There is no user in account !
account2
user2:allowed!
user3:blocked!

a_t3
There is no user in account !
`;

it("test whether the string from 'slurm.sh -l all' can be parsed successfully", async () => {
  const result = parseClusterUsers(dataStr);

  expect(result).toStrictEqual({ accounts: [
    {
      accountName: "a_user1",
      users: [
        { userId: "user1", userName: "user1", state: "allowed!" },
        { userId: "user2", userName: "user2", state: "blocked!" },
      ],
      owner: "user1",
      importState: ImportState.NOT_EXISTED,
    },
    {
      accountName: "account2",
      users: [
        { userId: "user2", userName: "user2", state: "allowed!" },
        { userId: "user3", userName: "user3", state: "blocked!" }],
      importState: ImportState.NOT_EXISTED,
    },
  ],
  });
});
