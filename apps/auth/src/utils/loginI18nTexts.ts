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

export const cnTexts: LoginTextsType = {
  login: "登录",
  accountPasswordLogin: "账号密码登录",
  username: "用户名",
  password: "密码",
  otpVCode: "OTP验证码",
  inputVCode: "请输入验证码",
  refreshError: "刷新失败，请点击重试",
  invalidVCode: "验证码无效，请重新输入。",
  invalidInput: "用户名/密码无效，请检查。",
  invalidOtp: "OTP验证码无效，请重新输入。",
  bindOtp: "绑定otp",
};

export const enTexts: LoginTextsType = {
  login: "Log In",
  accountPasswordLogin: "Account Password Login",
  username: "Username",
  password: "Password",
  otpVCode: "OTP Verification Code",
  inputVCode: "Please enter the verification code",
  refreshError: "Refresh failed, please click to retry.",
  invalidVCode: "Invalid verification code, please re-enter.",
  invalidInput: "Invalid username / password, please check.",
  invalidOtp: "Invalid OTP Verification Code, please re-enter.",
  bindOtp: "Bind OTP",
};

export type LoginTextsType = {
  login: string,
  accountPasswordLogin: string,
  username: string,
  password: string,
  otpVCode: string,
  inputVCode: string,
  refreshError: string,
  invalidVCode: string,
  invalidInput: string,
  invalidOtp: string,
  bindOtp: string,
};

