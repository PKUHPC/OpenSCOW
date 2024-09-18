/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

const path = require("path");

const base = require("@ddadaal/eslint-config");
const licenseHeader = require("eslint-plugin-license-header");

module.exports = [
  {
    ignores: [
      "**/node_modules/",
      "**/build/",
      "**/coverage/",
      "**/next-env.d.ts",
      "**/generated/",
      "**/.turbo/",
      "**/.next",
      "**/.docusaurus/",
    ]
  },
  ...base,
  {
    plugins: {
      "license-header": licenseHeader,
    },
    rules: {
      "license-header/header": [
        "error",
        path.join(__dirname, "license-header"),
      ],
    }
  },
  {
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "require-await": "off",
      "@typescript-eslint/require-await": "off"
    }
  }

];
