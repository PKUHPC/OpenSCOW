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

import { parseBlockStatus } from "src/clusterops/slurm/utils/parse";

const dataStr1 = `
Account a_admin is allowed!
Account a_dd is allowed!
Account a_testa is blocked!
`;

it("test string from 'slurm.sh -m accountnames' can be parsed correctly", async () => {
  const result = parseBlockStatus(dataStr1);

  expect(result).toEqual({
    "a_admin": false,
    "a_dd": false,
    "a_testa": true,
  } as Record<string, boolean>);
});
