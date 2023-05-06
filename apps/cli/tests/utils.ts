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

import { existsSync, promises as fsp } from "fs";
import { writeFile } from "fs/promises";
import { dump } from "js-yaml";
import { join } from "path";

export const configPath = "tests/install.yaml";
export const testBaseFolder = `tests/testFolder${process.env.JEST_WORKER_ID}`;

beforeEach(async () => {
  await fsp.mkdir(testBaseFolder, { recursive: true });

});

afterEach(async () => {
  await fsp.rm(testBaseFolder, { recursive: true });
});

export async function createInstallYaml(content: object) {
  const yamlContent = dump(content);

  const configPath = join(testBaseFolder, "install.yaml");

  await writeFile(configPath, yamlContent);

  return configPath;
}

export async function ensureDirectoriesTheSame(dir1: string, dir2: string) {
  const files1 = await fsp.readdir(dir1);
  const files2 = await fsp.readdir(dir2);

  if (files1.length !== files2.length) {
    throw new Error(
      `Directories have different number of files. ${dir1} has ${files1.length}, ${dir2} has ${files2.length}`,
    );
  }

  for (const file of files1) {
    const filePath1 = join(dir1, file);
    const filePath2 = join(dir2, file);

    if (!existsSync(filePath2)) {
      throw new Error(
        `File ${filePath2} does not exist in ${dir2} but exists in ${dir1}`,
      );
    }

    const stat1 = await fsp.stat(filePath1);
    const stat2 = await fsp.stat(filePath2);

    if (stat1.isDirectory() && stat2.isDirectory()) {
      await ensureDirectoriesTheSame(filePath1, filePath2);
    } else if (stat1.isFile() && stat2.isFile()) {
      const content1 = await fsp.readFile(filePath1);
      const content2 = await fsp.readFile(filePath2);
      if (content1.compare(content2) !== 0) {
        throw new Error(`File ${filePath1} and ${filePath2} are different`);
      }
    } else {
      throw new Error(`File types ${filePath1} and ${filePath2} are different`);
    }
  }
}
