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

import { existsSync, readFileSync } from "fs";
// import { join } from "path";

interface VersionJsonInfo {
  tag?: string;
  commit: string;
}

export interface VersionInfo extends VersionJsonInfo {}

export function readVersionFile(versionJsonFileName = "version.json") {

  const jsonInfo: VersionJsonInfo = existsSync(versionJsonFileName)
    ? JSON.parse(readFileSync(versionJsonFileName, "utf-8"))
    : {};

  return jsonInfo; }


// SemVer类型version
export type ApiVersion = {
  major: number;
  minor: number;
  patch: number;
}

// // 获取当前调度器适配器接口仓库的API版本号
// export function getCurrentScowSchedulerApiVersion(): ApiVersion | null {

//   const schedulerAdapterJsonFilePath = join(__dirname, "../../protos/scheduler-adapter/package.json");
//   const packageJsonContent = JSON.parse(readFileSync(schedulerAdapterJsonFilePath, "utf-8"));

//   const match = packageJsonContent.scripts.generate.match(/(?<=#tag=v)([\d.]+)/);

//   const version = match ? match[1] : undefined;

//   if (version) {
//     const versionParts = version.split(".");
//     return {
//       major: parseInt(versionParts[0]),
//       minor: parseInt(versionParts[1]),
//       patch: parseInt(versionParts[2]),
//     };
//   } else {
//     return null;
//   }
// }

/**
 * 比较Version1与Version2版本
 * @param version1
 * @param version2
 * @returns
 * 1： Version1高于Version2
 * -1：Version1低于Version2
 * 0: Version1与Version2版本相同
 */
export function compareSemVersion(version1: ApiVersion, version2: ApiVersion): number {
  if (version1.major !== version2.major) {
    return version1.major > version2.major ? 1 : -1;
  } else if (version1.minor !== version2.minor) {
    return version1.minor > version2.minor ? 1 : -1;
  } else if (version1.patch !== version2.patch) {
    return version1.patch > version2.patch ? 1 : -1;
  } else {
    return 0;
  }
};
