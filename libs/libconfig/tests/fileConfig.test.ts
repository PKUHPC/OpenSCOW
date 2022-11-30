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

import { Static, Type } from "@sinclair/typebox";
import fs from "fs";
import { dump } from "js-yaml";
import path from "path";
import { getConfigFromFile } from "src/fileConfig";

const configName = "test";

const Schema = Type.Object({
  loaded: Type.String(),
});

const folderPath = path.join(__dirname, "configFileTest" + process.env.JEST_TEST_ID);

const exts = {
  yml: dump,
  yaml: dump,
  json: JSON.stringify,
};

type Ext = keyof typeof exts;

function createConfig(ext: Ext) {
  const obj: Static<typeof Schema> = { loaded: ext };

  const content = exts[ext](obj);

  fs.writeFileSync(path.join(folderPath, configName + "." + ext), content);
}

beforeEach(() => {
  fs.mkdirSync(folderPath);
});

afterEach(() => {
  fs.rmSync(folderPath, { recursive: true });
});

function runTest(createdFiles: readonly Ext[], expectedLoaded: Ext) {
  createdFiles.forEach(createConfig);

  const obj = getConfigFromFile(Schema, configName, folderPath);

  expect(obj.loaded).toBe(expectedLoaded);
}

it.each([
  [["yml"], "yml"],
  [["yaml"], "yaml"],
  [["json"], "json"],
  [["yml", "yaml"], "yml"],
  [["yaml", "json"], "yaml"],
] as const)("creates %o, should load %o", async (createdExts: readonly Ext[], expectedLoaded: Ext) => {
  runTest(createdExts, expectedLoaded);
});


it("reports error if config not exist", async () => {
  expect(() => runTest([], "yml")).toThrow();
});

it("reports file path", async () => {

  fs.writeFileSync(path.join(folderPath, configName + ".yaml"), exts.yaml({ loaded: false }));
  try {
    getConfigFromFile(Schema, configName, folderPath);
    expect("").fail("should throw");
  } catch (e: any) {
    expect(e.message).toContain(path.join(folderPath, configName + ".yaml"));
  }
});
