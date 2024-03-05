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

import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";


export const ShellAuditConfigSchema = Type.Object({

  auditShell: Type.Boolean({ description: "Enable audit shell", default: false }),

  url: Type.String({
    description: "Shell Audit Server的URL, 默认为0.0.0.0:50051", default: "0.0.0.0:50051",
  }),

});

const SHELL_AUDIT_CONFIG_NAME = "shellAudit";

export type ShellAuditConfigSchema = Static<typeof ShellAuditConfigSchema>;

export const getShellAuditConfig: GetConfigFn<ShellAuditConfigSchema> = (baseConfigPath) => {
  const config =
    getConfigFromFile(ShellAuditConfigSchema, SHELL_AUDIT_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

  return config;

};
