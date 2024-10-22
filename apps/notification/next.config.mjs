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
import { join } from "path";

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/";
const building = process.env.BUILDING === "1";

/** @type {import('next').NextConfig} */

export default async () => {
  global.__CONFIG__ = {
    BASE_PATH,
  };

  if (!building) {
    console.log("Running @scow/notification");

    // HACK setup cron job
    setTimeout(() => {
      const url = `http://localhost:${process.env.PORT || 3000}${join(BASE_PATH, "/api/setup")}`;
      console.log("Calling setup url to initialize cron job", url);

      fetch(url).then(async () => {
        console.log("Call completed.");
      }).catch((e) => {
        console.error("Error when calling cron job url to initialize task", e);
      });
    });

  }

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
