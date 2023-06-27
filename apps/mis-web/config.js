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

const { envConfig, str, bool } = require("@scow/lib-config");
const { getClusterConfigs } = require("@scow/config/build/cluster");
const { getMisConfig } = require("@scow/config/build/mis");
const { getCommonConfig } = require("@scow/config/build/common");
const { getClusterTextsConfig } = require("@scow/config/build/clusterTexts");
const { DEFAULT_PRIMARY_COLOR, getUiConfig } = require("@scow/config/build/ui");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require("next/constants");
const { join } = require("path");
const { getCapabilities } = require("@scow/lib-auth");
const { readVersionFile } = require("@scow/utils/build/version");

/**
 * Get auth capabilities
 * @param {string} authUrl the url for auth service
 * @param {string} phase the build phase
 */
async function queryCapabilities(authUrl, phase) {

  if (phase === PHASE_PRODUCTION_SERVER) {
    // @ts-ignore
    return await getCapabilities(authUrl);
  } else {
    return { changePassword: true, createUser: true, validateName: true };
  }
}

const specs = {
  AUTH_EXTERNAL_URL: str({ desc: "认证系统的URL。如果部署在和本系统一样的域名下，可以只写完整路径", default: "/auth" }),

  SERVER_URL: str({ desc: "后端服务地址", default: "mis-server:5000" }),

  AUTH_ORIGIN: str({ desc: "认证系统的域名。如果认证系统和本系统部署在同一个域名下，不填写", default: undefined }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  PORTAL_DEPLOYED: bool({ desc: "是否部署了门户系统", default: false }),
  PORTAL_URL: str({ desc: "如果部署了门户系统，门户系统的URL。如果和本系统域名相同，可以只写完整路径。将会覆盖配置文件。空字符串等价于未部署门户系统", default: "" }),

  PUBLIC_PATH: str({ desc: "SCOW公共文件的路径，需已包含SCOW的base path", default: "/public/" }),
};

const mockEnv = process.env.NEXT_PUBLIC_USE_MOCK === "1";

const config = envConfig(specs, process.env);

/**
 * Build system runtime config
 * @param {string} phase Next.js phase
 * @param {string} basePath basePath of the system
 * @returns RuntimeConfig
 */
const buildRuntimeConfig = async (phase, basePath) => {

  const building = phase === PHASE_PRODUCTION_BUILD;
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  // const production = phase === PHASE_PRODUCTION_SERVER;

  if (building) {
    return { serverRuntimeConfig: {}, publicRuntimeConfig: {} };
  }

  if (dev) {
    require("dotenv").config({ path: "env/.env.dev" });
  }

  const config = envConfig(specs, process.env);

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  const configBasePath = mockEnv ? join(__dirname, "config") : undefined;

  const clusters = getClusterConfigs(configBasePath, console);
  const clusterTexts = getClusterTextsConfig(configBasePath, console);
  const uiConfig = getUiConfig(configBasePath, console);
  const misConfig = getMisConfig(configBasePath, console);

  const commonConfig = getCommonConfig(configBasePath, console);

  const versionTag = readVersionFile()?.tag;

  /**
   * @type {import ("./src/utils/config").ServerRuntimeConfig}
   */
  const serverRuntimeConfig = {
    AUTH_EXTERNAL_URL: config.AUTH_EXTERNAL_URL,
    AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
    CLUSTERS_CONFIG: clusters,
    CLUSTER_TEXTS_CONFIG: clusterTexts,
    UI_CONFIG: uiConfig,
    DEFAULT_PRIMARY_COLOR,
    SERVER_URL: config.SERVER_URL,
    SCOW_API_AUTH_TOKEN: commonConfig.scowApi?.auth?.token,
  };

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {
    CREATE_USER_CONFIG: {
      misConfig: misConfig.createUser,
      authSupportsCreateUser: capabilities.createUser,
    },
    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,
    PREDEFINED_CHARGING_TYPES: misConfig.predefinedChargingTypes,

    PUBLIC_PATH: config.PUBLIC_PATH,

    CLUSTERS: Object.keys(clusters).reduce((prev, curr) => {
      prev[curr] = { id: curr, name: clusters[curr].displayName };
      return prev;
    }, {}),

    ACCOUNT_NAME_PATTERN: misConfig.accountNamePattern?.regex,
    ACCOUNT_NAME_PATTERN_MESSAGE: misConfig.accountNamePattern?.errorMessage,

    PORTAL_URL: config.PORTAL_DEPLOYED ? (config.PORTAL_URL || misConfig.portalUrl || "") : undefined,

    PASSWORD_PATTERN: commonConfig.passwordPattern?.regex,
    PASSWORD_PATTERN_MESSAGE: commonConfig.passwordPattern?.errorMessage,

    BASE_PATH: basePath,

    NAV_LINKS: misConfig.navLinks,

    VERSION_TAG: versionTag,
  };

  if (!building) {
    console.log("Running @scow/mis-web");
    console.log("Version: ", readVersionFile());
    console.log("Server Runtime Config", serverRuntimeConfig);
    console.log("Public Runtime Config", publicRuntimeConfig);
  }

  return {
    serverRuntimeConfig,
    publicRuntimeConfig,
  };
};

module.exports = {
  buildRuntimeConfig,
  config,
};
