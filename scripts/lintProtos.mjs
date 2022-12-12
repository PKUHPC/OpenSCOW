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

import { exec } from "node:child_process";
import os from "node:os";

const iswin = os.platform() === "win32";
const cwd = iswin ? "%cd%" : "$(pwd)";

exec(`docker run --rm --volume "${cwd}:/workspace" --workdir /workspace yoheimuta/protolint -fix protos`, {
  shell: iswin ? "cmd.exe" : undefined,
}, (err, _stdout, stderr) => {
  if (err) {
    console.error(stderr);
    process.exit(err.code);
  }
});
