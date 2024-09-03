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

export const validateChinese = (rule, value, allowPunctuation = false) => {
  const chineseRegex = allowPunctuation
    ? /^[\u4e00-\u9fa5，。！？!.?_, ]+$/
    : /^[\u4e00-\u9fa5]+$/;
  if (value && !chineseRegex.test(value)) {
    return Promise.reject(new Error("请输入简体中文"));
  }
  return Promise.resolve();
};

export const validateEnglish = (rule, value, allowPunctuation = false) => {
  const englishRegex = allowPunctuation
    ? /^[A-Za-z,!.?_，。！？ ]+$/
    : /^[A-Za-z]+$/;
  if (value && !englishRegex.test(value)) {
    return Promise.reject(new Error("请输入英文"));
  }
  return Promise.resolve();
};
