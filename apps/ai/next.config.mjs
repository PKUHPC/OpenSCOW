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

// const withPlugins = require("next-compose-plugins");

import withPlugins from "next-compose-plugins";

const analyze = process.env.ANALYZE === "true";

const ConfigModule = await import("./config.js");
const { buildRuntimeConfig } = ConfigModule;

const BASE_PATH = process.env.BASE_PATH || "/";


export default async (phase) => {

  const runtimeConfig = await buildRuntimeConfig(phase, BASE_PATH);

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    ...runtimeConfig,
    compiler: {
      styledComponents: true,
    },
    // experimental: {
    //   appDir: true,
    // },
    webpack: (config) => {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js"],
        ".jsx": [".ts", ".tsx", ".js"],
      };
      return config;
    },
    compiler: {
      styledComponents: true,
    },
    skipTrailingSlashRedirect: true,
    transpilePackages: ["antd", "@ant-design/icons"],
  };

  return nextConfig;
};
