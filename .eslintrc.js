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

module.exports = {
  "extends": "@ddadaal",
  "plugins": [
    "license-header",
  ],
  "rules": {
    "license-header/header": [
      "error",
      path.join(__dirname, "license-header"),
    ],
  },
  "overrides": [
    {
      "files": ["**/*.js", "apps/**/*.js"],
      "rules": {
        "@typescript-eslint/no-var-requires": "off",
      },
    },
  ],
};
