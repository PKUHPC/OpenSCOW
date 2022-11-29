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

import { constructCommand } from "@scow/lib-ssh";

it.each([
  [["test", [], {}], "test"],
  [["test", ["-a", "123"], {}], "test -a 123"],
  [["test", ["-a", "\"123\""], {}], "test -a '\"123\"'"],
  [["test", ["-a", "\"123\""], { TEST: "test", QUOTE: "\"QUOTE\"" }], "TEST=test QUOTE='\"QUOTE\"' test -a '\"123\"'"],
  [["test", ["-a", "\"123\""], { SPACE: "' SPACE '" }], "SPACE=\"' SPACE '\" test -a '\"123\"'"],
] as const)("test construct env command", ([cmd, parameters, env], expected) => {
  expect(constructCommand(cmd, parameters, env)).toBe(expected);
});
