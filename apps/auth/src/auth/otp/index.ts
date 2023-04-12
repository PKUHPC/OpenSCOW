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
import { authConfig, LdapConfigSchema, OtpStatusOptions } from "src/config/auth";

import { bindClickAuthLinkInEmailRoute, bindClickRequestBindingLinkRoute,
  bindRedirectLoinUIAndBindUIRoute, bindValidateUserNameAndPasswordRoute } from "./routeHandles";

export function registerOtpBindPostHandler(f: FastifyInstance, ldapConfig: LdapConfigSchema) {

  if (authConfig.otp?.type === OtpStatusOptions.disabled || !authConfig.otp?.type) {
    return;
  }

  /**
   *  登录界面->绑定OTP界面
   *  绑定OTP界面->登录界面重定向
   * */
  bindRedirectLoinUIAndBindUIRoute(f);

  if (authConfig.otp.type === "ldap") {
    // 绑定路由，路由处理验证账户密码
    bindValidateUserNameAndPasswordRoute(f, ldapConfig);
    // 绑定路由，路由处理发邮件
    bindClickRequestBindingLinkRoute(f);
    // 绑定路由，路由处理绑定获取二维码
    bindClickAuthLinkInEmailRoute(f, ldapConfig);

  }
}
