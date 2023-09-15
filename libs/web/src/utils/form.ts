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

import { getCurrentLangLibWebText } from "./libWebI18nTexts";



export const confirmPasswordFormItemProps = <
  PasswordFieldName extends string,
  T extends { [key in PasswordFieldName]: string }
>(form: FormInstance<T>, passwordFieldName: PasswordFieldName, languageId: string) => {
  return {
    dependencies: [passwordFieldName],
    validateFirst: true,
    rules: [
      {
        required: true,
        message: getCurrentLangLibWebText(languageId, "form.confirmPasswordForm.message"),
      },
      {
        validator: async (_, value) => {
          if (value && form.getFieldValue(passwordFieldName) !== value) {
            throw new Error(getCurrentLangLibWebText(languageId, "form.confirmPasswordForm.notEqualError"));
          }
        },
      },
    ],
  };
};

export const getEmailRule = (languageId: string) => ({
  type: "email",
  message: getCurrentLangLibWebText(languageId, "form.confirmPasswordForm.message"),
}) as const;
