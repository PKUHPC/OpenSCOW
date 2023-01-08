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

import { splitSbatchArgs } from "src/models/job";

it.each([
  [" ", []],
  ["  -o file.out ", ["-o file.out"]],
  ["  --name=file.out", ["--name=file.out"]],
  ["--name=file.out  ", ["--name=file.out"]],
  [" --name=file.out  ", ["--name=file.out"]],
  [" --name=file.out   -o file.out  ", ["--name=file.out", "-o file.out"]],
  [" --job-name=file.out   --time=60  ", ["--job-name=file.out", "--time=60"]],
])("split sbatch options %p to %p", (str: string, expected: string[]) => {
  expect(splitSbatchArgs(str)).toEqual(expected);
});