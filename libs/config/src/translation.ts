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

export type TranslationRecord = {
  [key: string]: string | TranslationRecord;
}
export type CustomTranslation = {
  "custom-translation": boolean;
  "en"?: TranslationRecord;
  "zh_cn"?: TranslationRecord;
}

// 加载用户自定义的翻译 JSON 文件
export const getCustomTranslationJson = () => {
  let customTransJson;
  try {
    customTransJson = require("../../../apps/mis-web/public/custom-translation.json");
    if (customTransJson["custom-translation"] === true) {
      return customTransJson;
    } else {
      return {};
    }
  } catch (error) {
    console.error("Error loading custom translation:", error);
    return null;
  }

};

