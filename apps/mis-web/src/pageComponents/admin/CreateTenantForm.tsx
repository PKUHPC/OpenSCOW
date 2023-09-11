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

import { Divider, Form, Input } from "antd";
import React, { useEffect, useState } from "react";
import { useI18n } from "src/i18n";
import { checkI18nValue } from "src/utils/checkI18nValue";
import { publicConfig } from "src/utils/config";
import { getUserIdRule, useBuiltinCreateUser } from "src/utils/createUser";
import { confirmPasswordFormItemProps, emailRule, passwordRule } from "src/utils/form";
export interface CreateTenantFormFields {
  tenantName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPassword: string;
  userConfirmPassword: string;
}

export const CreateTenantForm: React.FC = () => {

  const form = Form.useFormInstance<CreateTenantFormFields>();

  const userIdRule = getUserIdRule();

  const passwordRuleI18nMessage = publicConfig.CUSTOM_I18N_CONFIG.COMMON_PASSWORD_PATTERN_MESSAGE;
  const langId = useI18n().currentLanguage.id;
  const [passwordRuleMessage, setPasswordRuleMessage] = useState("");

  useEffect(() => {
    // 如果i18n类型值存在，则按国际化逻辑显示
    if (passwordRuleI18nMessage) {
      setPasswordRuleMessage(checkI18nValue(passwordRuleI18nMessage, langId));
    // 如果i18n类型值不存在，则按字符串类型逻辑显示
    } else {
      setPasswordRuleMessage(passwordRule.message ?? "");
    }
  }, [langId, passwordRule.message]);


  return (
    <>
      <Divider
        style={{ marginTop: 0 }}
        orientation="left"
        orientationMargin="0"
        plain
      >请输入租户名并为其创建一个新用户作为该租户的管理员</Divider>
      <Form.Item
        label="租户名称"
        name="tenantName"
        rules={[
          { required: true },
        ]}
      >
        <Input />
      </Form.Item>
      <Divider orientation="left" orientationMargin="0" plain>管理员信息</Divider>
      <Form.Item
        label="用户ID"
        name="userId"
        rules={[
          { required: true },
          ...userIdRule ? [userIdRule] : [],
        ]}
      >
        <Input placeholder={userIdRule?.message} />
      </Form.Item>
      <Form.Item label="用户姓名" name="userName" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="用户邮箱"
        name="userEmail"
        rules={[{ required: true }, emailRule]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="用户密码"
        name="userPassword"
        rules={[{ required: true }, passwordRule]}
      >
        <Input.Password placeholder={passwordRuleMessage} />
      </Form.Item>
      {
        useBuiltinCreateUser() ? (
          <>
            <Form.Item
              label="确认密码"
              name="confirmPassword"
              hasFeedback
              {...confirmPasswordFormItemProps(form, "userPassword")}
            >
              <Input.Password placeholder={passwordRuleMessage} />
            </Form.Item>
          </>
        ) : undefined
      }
    </>
  );
};
