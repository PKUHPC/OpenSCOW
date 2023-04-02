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

import { FastifyInstance } from "fastify";
import { authConfig, LdapConfigSchema, OTPStatusOptions } from "src/config/auth";

import { generateIvAndKey } from "./aesUtils";
import { clickAuthLinkInEmail, clickRequestBindingLink,
  redirectLoinUIAndBindUI, validateUserNameAndPassword } from "./routeHandles";

export function registerOTPBindPostHandler(f: FastifyInstance, ldapConfig: LdapConfigSchema) {

  if (authConfig.otp.status === OTPStatusOptions.disabled) {
    return;
  }

  /**
   *  登录界面->绑定OTP界面
   *  绑定OTP界面->登录界面重定向
   * */
  redirectLoinUIAndBindUI(f);

  if (authConfig.otp.status === "local") {
    // 用于绑定账户时OTPSession不暴露于前端
    generateIvAndKey();
    // 验证账户密码
    validateUserNameAndPassword(f, ldapConfig);
    // 发邮件
    clickRequestBindingLink(f);
    // 绑定获取二维码
    clickAuthLinkInEmail(f, ldapConfig);
  }
}
