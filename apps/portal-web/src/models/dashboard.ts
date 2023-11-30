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

export interface PageLinkEntry {
  path: string;
  /** antd的图标ID */
  icon: string;
}

export interface ShellEntry {
  clusterId: string;
  loginNode: string;
  /** antd的图标ID */
  icon: string;
}

export interface AppEntry {
  clusterId: string;
  logoPath: string;
}

export interface Entry {
  id: string;
  name: string;
  entry?: { $case: "pageLink"; pageLink: PageLinkEntry } | { $case: "shell"; shell: ShellEntry } | {
    $case: "app";
    app: AppEntry;
  } | undefined;
}
