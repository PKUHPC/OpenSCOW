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

const interpreter = "node";
const interpreter_args = [
  "--watch",
  "-r ts-node/register",
  "-r tsconfig-paths/register",
].join(" ");

const PRODUCTION_ENV = {
  NODE_ENV: "production",
};

const SCOW_CONFIG_PATH_ENV = {
  SCOW_CONFIG_PATH: "../../dev/vagrant/config",
};

module.exports = {
  apps: [
    {
      name: "auth",
      script: "src/index.ts",
      cwd: "./apps/auth",
      watch: "./apps/auth",
      interpreter,
      interpreter_args,
      env: {
        PORT: "5000",
        AUTH_BASE_PATH: "/",
        ...PRODUCTION_ENV,
        ...SCOW_CONFIG_PATH_ENV,
      },
    },
    // {
    //   name: "portal-web",
    //   script: "npm",
    //   args: "run dev:server",
    //   interpreter: "pnpm",
    //   cwd: "./apps/portal-web",
    //   env: {
    //     PORT: "5001",
    //     AUTH_EXTERNAL_URL: "http://localhost:5000",
    //     AUTH_INTERNAL_URL: "http://localhost:5000",
    //     NEXT_PUBLIC_USE_MOCK: 0,
    //     SERVER_URL: "localhost:5002",
    //     MIS_DEPLOYED: 1,
    //     MIS_URL: "localhost:5003",
    //     NOVNC_CLIENT_URL: "http://localhost:6080",
    //     ...SCOW_CONFIG_PATH_ENV,
    //   },
    // },
    // {
    //   name: "portal-server",
    //   script: "src/index.ts",
    //   cwd: "./apps/portal-server",
    //   watch: "./apps/portal-server",
    //   interpreter,
    //   interpreter_args,
    //   env: {
    //     PORT: "5002",
    //     ...PRODUCTION_ENV,
    //     ...SCOW_CONFIG_PATH_ENV,
    //   },
    // },
    {
      name: "mis-web",
      script: "npm",
      args: "run dev:server",
      cwd: "./apps/mis-web",
      interpreter: "pnpm",
      env: {
        PORT: "5003",
        AUTH_EXTERNAL_URL: "http://localhost:5000",
        AUTH_INTERNAL_URL: "http://localhost:5000",
        NEXT_PUBLIC_USE_MOCK: 0,
        SERVER_URL: "localhost:5004",
        PORTAL_DEPLOYED: 1,
        PORTAL_URL: "localhost:5001",
        ...SCOW_CONFIG_PATH_ENV,
      },
    },
    {
      name: "mis-server",
      script: "src/index.ts",
      cwd: "./apps/mis-server",
      watch: "./apps/mis-server",
      interpreter,
      interpreter_args,
      env: {
        PORT: "5004",
        ...PRODUCTION_ENV,
        ...SCOW_CONFIG_PATH_ENV,
      },
    },
    {
      name: "dev:libs",
      cwd: ".",
      script: "npm",
      args: "run dev:libs",
      interpreter: "pnpm",
    },
  ],

};
