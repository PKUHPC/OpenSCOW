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

// This file is auto-generated, don't edit it
// 依赖的模块可通过下载工程中的模块依赖文件或右上角的获取 SDK 依赖信息查看
import Dysmsapi20170525, * as $Dysmsapi20170525 from "@alicloud/dysmsapi20170525";
import * as $OpenApi from "@alicloud/openapi-client";
import * as $Util from "@alicloud/tea-util";
import { authConfig } from "src/config/auth";

export enum TemplateCode {
  sendVerification = "sendVerification",
  resetPassword = "resetPassword",
  registerSuccess = "registerSuccess",
  adminRegisterOrInviteUser = "adminRegisterOrInviteUser",
}

export const TemplateCodeMap = {
  [TemplateCode.sendVerification]: "SMS_463622382",
  [TemplateCode.resetPassword]: "SMS_463627607",
  [TemplateCode.registerSuccess]: "SMS_463642581",
  [TemplateCode.adminRegisterOrInviteUser]: "SMS_463672645",
};

export type TemplateCodeValue = typeof TemplateCodeMap[keyof typeof TemplateCodeMap]
interface VerificationParams {
  code: string
}
interface ResetPasswordParams {
  name: string
  password: string
}

interface RegisterSuccessParams {
  name: string
}

interface AdminRegisterOrInviteUserParams {
  name: string
  password: string
}

interface TemplateParamMapping {
  [TemplateCode.sendVerification]: VerificationParams;
  [TemplateCode.resetPassword]: ResetPasswordParams;
  [TemplateCode.registerSuccess]: RegisterSuccessParams;
  [TemplateCode.adminRegisterOrInviteUser]: AdminRegisterOrInviteUserParams;
}

interface InputMessageParams<T extends TemplateCode> {
  templateCode: T,
  phoneNumbers: string,
  templateParam: TemplateParamMapping[T]
}

interface SendMessageResponse {
  result?: string,
}

export async function sendMessage<T extends TemplateCode>(
  params: InputMessageParams<T>,
): Promise<SendMessageResponse> {
  const { templateCode, templateParam } = params;
  const formatTemplateParam =
      `{${Object.keys(templateParam).map((key) => `"${key}":"${templateParam[key]}"`).join(",")}}`;
  const response = await MessageClient.main({
    ...params,
    templateCode: TemplateCodeMap[templateCode],
    templateParam: formatTemplateParam,
  });

  return {
    result: response.body.code,
  };

}

interface MessageParams {
  templateCode: TemplateCodeValue,
  phoneNumbers: string,
  templateParam: string
}
export default class MessageClient {

  /**
   * 使用AK&SK初始化账号Client
   * @param accessKeyId
   * @param accessKeySecret
   * @return Client
   * @throws Exception
   */
  static createClient(accessKeyId: string, accessKeySecret: string): Dysmsapi20170525 {
    const config = new $OpenApi.Config({
      // 必填，您的 AccessKey ID
      accessKeyId: accessKeyId,
      // 必填，您的 AccessKey Secret
      accessKeySecret: accessKeySecret,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
    config.endpoint = "dysmsapi.aliyuncs.com";
    const d = new Dysmsapi20170525(config);
    return d;
  }

  static async main(args: MessageParams) {
    // 请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID 和 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
    const client = MessageClient.createClient(authConfig.alibabaCloudAccessKeyId,
      authConfig.alibabaCloudAccessKeySecret);

    const sendSmsRequest = new $Dysmsapi20170525.SendSmsRequest({
      signName: "XSCOW",
      ...args,
    });
    const runtime = new $Util.RuntimeOptions({ });

    return client.sendSmsWithOptions(sendSmsRequest, runtime);
  }

}

export const NON_LIVING_VERIFICATION_CODE = "1234";
