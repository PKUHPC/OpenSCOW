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

import { i18n } from "next-i18next";

import { publicConfig } from "./config";



export async function loadCustomTranslations() {

  // 加载用户自定义的翻译 JSON 文件
  const customTranslation = publicConfig.CUSTOM_TRANSLATION_JSON;
  if (customTranslation) {
    Object.keys(customTranslation).filter((key) => key !== "custom-translation").forEach((locale) => {
      i18n?.addResource(locale, "custom",
        customTranslation[locale].key, customTranslation[locale].value, { keySeparator: ".", silent: false });
    });
    i18n?.addResourceBundle("en", "custom", customTranslation.en, true, true);
    i18n?.addResourceBundle("zh_cn", "custom", customTranslation.zh_cn, true, true);
  }

}






