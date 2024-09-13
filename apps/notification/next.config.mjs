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

import os from "os";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/";

/** @type {import('next').NextConfig} */

export default async () => {
  global.__CONFIG__ = {
    BASE_PATH,
  };

  const nextConfig = {

    compiler: {
      styledComponents: true,
    },
    swcMinify: false,
    basePath: BASE_PATH === "/" ? undefined : BASE_PATH,
    assetPrefix: BASE_PATH === "/" ? undefined : BASE_PATH,
    webpack: (config) => {
      config.resolve.extensionAlias = {
        ".js": [".ts", ".tsx", ".js"],
        ".jsx": [".ts", ".tsx", ".js"],
      };
      config.module.rules.push({
        test: /\.node$/,
        use: [
          {
            loader: "nextjs-node-loader",
            options: {
              flags: os.constants.dlopen.RTLD_NOW,
              outputPath: config.output.path,
            },
          },
        ],
      });

      return config;
    },
    skipTrailingSlashRedirect: true,
    transpilePackages: ["antd", "@ant-design/icons"],
  };

  return nextConfig;
};
