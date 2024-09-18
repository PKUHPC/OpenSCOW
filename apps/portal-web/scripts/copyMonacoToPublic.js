/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

const fs = require("fs-extra");
const path = require("path");

const sourcePath = path.join(__dirname, "../node_modules/monaco-editor/min/vs");
const targetPath = path.join(__dirname, "../public/monaco-assets/vs");

// Check if the source directory exists
if (!fs.existsSync(sourcePath)) {
  console.error(
    `Error: Source directory ${sourcePath} does not exist. Ensure the target package is correctly installed.`);
  process.exit(1);
}

// Ensure the target path exists, if not, create it
fs.ensureDirSync(targetPath);

// Attempt to copy
try {
  fs.copySync(sourcePath, targetPath, {
    overwrite: true,
    errorOnExist: false,
  });
  console.log(`Success: Copied from ${sourcePath} to ${targetPath}.`);
} catch (error) {
  console.error(`Error: An issue occurred during the copy process. Details: ${error.message}`);
  process.exit(1);
}

console.log(`Copied files from ${sourcePath} to ${targetPath}`);
