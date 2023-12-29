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

import { RuleObject } from "antd/lib/form/index.js";

export const noWhiteSpaceRule = {
  type: "string" as const,
  required: true,
  whitespace: true,
};

export const validateNoChinese = (_: RuleObject, value: any) => {
  // 使用正则表达式验证是否包含中文字符
  if (/[\u4e00-\u9fa5]/.test(value)) {
    return Promise.reject("不能包含中文字符");
  }
  return Promise.resolve();
};
