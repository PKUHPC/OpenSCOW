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

import { publicConfig } from "src/utils/config";

export const useBuiltinCreateUser = () => {
  return (
    publicConfig.CREATE_USER_CONFIG.authSupportsCreateUser &&
    publicConfig.CREATE_USER_CONFIG.misConfig.enabled &&
    publicConfig.CREATE_USER_CONFIG.misConfig.type === "builtin"
  );
};

export const userIdRule = (
  useBuiltinCreateUser() && publicConfig.CREATE_USER_CONFIG.misConfig.builtin?.userIdPattern
) ? {
    pattern: new RegExp(publicConfig.CREATE_USER_CONFIG.misConfig.builtin.userIdPattern.regex),
    message: publicConfig.CREATE_USER_CONFIG.misConfig.builtin.userIdPattern.errorMessage,
  } : undefined;
