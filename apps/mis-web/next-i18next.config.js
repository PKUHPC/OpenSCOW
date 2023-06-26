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

const path = require("path");

// @ts-check

/**
 * @type {import('next-i18next').UserConfig}
 */
module.exports = {
  // // https://www.i18next.com/overview/configuration-options#logging
  // debug: process.env.NODE_ENV === 'development',
  i18n: {
    defaultLocale: "zh_cn",
    locales: ["zh_cn", "en"],

    localePath: path.resolve("./public/locales"),
    defaultNs: "translations",
    ns: ["translations"],
    reloadOnPrerender: true,
    localeDetection: false,
    keySeparator: ".",
    fallbackLng: "zh_cn",

  },

};
