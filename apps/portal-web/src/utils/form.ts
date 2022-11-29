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

import { FormInstance } from "antd";

export const passwordRule = {
  pattern: /^(?=.*\d)(?=.*[a-zA-Z])(?=.*[`~!@#\$%^&*()_+\-[\];',./{}|:"<>?]).{8,}$/,
  message: "必须包含字母、数字和符号，八位及以上",
};


export const confirmPasswordFormItemProps = <
  PasswordFieldName extends string,
  T extends { [key in PasswordFieldName]: string }
>(form: FormInstance<T>, passwordFieldName: PasswordFieldName) => {
  return {
    dependencies: [passwordFieldName],
    validateFirst: true,
    rules: [
      {
        required: true,
        message: "请确认密码",
      },
      {
        validator: async (_, value) => {
          if (value && form.getFieldValue(passwordFieldName) !== value) {
            throw new Error("两次密码输入不一致，请重新输入");
          }
        },
      },
    ],
  };
};

export const emailRule = ({
  type: "email",
  message: "邮箱格式不正确，请重新输入",
}) as const;
