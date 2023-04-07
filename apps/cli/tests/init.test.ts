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

import { promises as fsp } from "fs";
import { init } from "src/cmd/init";
import { compareDirectories, configPath, testBaseFolder } from "tests/utils";

beforeEach(async () => {
  await fsp.mkdir(testBaseFolder, { recursive: true });

});

afterEach(async () => {
  await fsp.rm(testBaseFolder, { recursive: true });
});

it("should extract init config to output path", async () => {
  await init({
    configPath,
    outputPath: testBaseFolder,
  });

  // testBaseFolder and configPath should be the same
  expect(await compareDirectories(testBaseFolder, "assets")).toBe(true);
});

