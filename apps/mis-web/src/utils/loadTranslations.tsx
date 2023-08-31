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

import * as EnCommon from "../../public/locales/en/common.json";
import * as EnLayouts from "../../public/locales/en/layouts.json";
import * as EnTranslations from "../../public/locales/en/translations.json";
import * as CnCommon from "../../public/locales/zh_cn/common.json";
import * as CnLayouts from "../../public/locales/zh_cn/layouts.json";
import * as CnTranslations from "../../public/locales/zh_cn/translations.json";

export function loadTranslations() {

  // add othersTranslations
  i18n?.addResourceBundle("en", "common", EnCommon, true, true);
  i18n?.addResourceBundle("zh_cn", "common", CnCommon, true, true);
  i18n?.addResourceBundle("en", "layouts", EnLayouts, true, true);
  i18n?.addResourceBundle("zh_cn", "layouts", CnLayouts, true, true);
  i18n?.addResourceBundle("en", "translations", EnTranslations, true, true);
  i18n?.addResourceBundle("zh_cn", "translations", CnTranslations, true, true);

  i18n?.reloadResources();

  console.log("【addResource后的i18n】", i18n?.options.resources, i18n);
}






