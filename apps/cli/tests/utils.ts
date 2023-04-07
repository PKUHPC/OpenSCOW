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
import { join } from "path";

export const configPath = "tests/init.test.ts";
export const testBaseFolder = `tests/testFolder${process.env.JEST_WORKER_ID}`;

export async function compareDirectories(dir1: string, dir2: string): Promise<boolean> {
  const files1 = await fsp.readdir(dir1);
  const files2 = await fsp.readdir(dir2);

  if (files1.length !== files2.length) {
    return false;
  }

  for (const file of files1) {
    const filePath1 = join(dir1, file);
    const filePath2 = join(dir2, file);

    if (!existsSync(filePath2)) {
      return false;
    }

    const stat1 = await fsp.stat(filePath1);
    const stat2 = await fsp.stat(filePath2);

    if (stat1.isDirectory() && stat2.isDirectory()) {
      if (!compareDirectories(filePath1, filePath2)) {
        return false;
      }
    } else if (stat1.isFile() && stat2.isFile()) {
      if (fsp.readFile(filePath1).toString() !== fsp.readFile(filePath2).toString()) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
