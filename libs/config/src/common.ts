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

export const ScowHookConfigSchema = Type.Object({
  enabled: Type.Boolean({ description: "是否启用SCOW Hook", default: true }),
  url: Type.String({ description: "SCOW Hook的URL" }),
}, { description: "SCOW Hook配置" });

export const CommonConfigSchema = Type.Object({
  passwordPattern: Type.Object({
    regex: Type.String({
      description: "用户密码的正则规则",
      default: "^(?=.*\d)(?=.*[a-zA-Z])(?=.*[`~!@#\$%^&*()_+\-[\];',./{}|:\"<>?]).{8,}$",
    }),
    errorMessage: Type.String({
      description: "如果密码不符合规则显示什么",
      default: "必须包含字母、数字和符号，长度大于等于8位",
    }),
  }, { description: "创建用户、修改密码时的密码的规则" }),

  scowHook: Type.Optional(ScowHookConfigSchema),
});

const COMMON_CONFIG_NAME = "common";

export type ScowHookConfigSchema = Static<typeof ScowHookConfigSchema>;
export type CommonConfigSchema = Static<typeof CommonConfigSchema>;

export const getCommonConfig: GetConfigFn<CommonConfigSchema> = (baseConfigPath) =>
  getConfigFromFile(CommonConfigSchema, COMMON_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);
