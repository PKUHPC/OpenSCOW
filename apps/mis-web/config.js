// @ts-check

const { envConfig, getConfigFromFile, parseKeyValue, regex, str } = require("@scow/config");
const { ClusterConfigSchema, getClusterConfigs } = require("@scow/config/build/appConfig/cluster");
const { SlurmMisConfigSchema, MisConfigSchema, MIS_CONFIG_NAME } = require("@scow/config/build/appConfig/mis");
const { ClusterTextsConfigName, ClusterTextsConfigSchema } = require("@scow/config/build/appConfig/clusterTexts");
const { DEFAULT_PRIMARY_COLOR, UI_CONFIG_NAME, UiConfigSchema } = require("@scow/config/build/appConfig/ui");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER } = require("next/constants");
const { join } = require("path");
const { fetch } = require("undici");
const { getCapabilities } = require("@scow/lib-auth");

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

  SERVER_URL: str({ desc: "后端服务地址", default: "mis-server:5000" }),

  AUTH_EXTERNAL_URL: str({ desc: "认证服务外网地址", default: "/auth" }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  PORTAL_URL: str({ desc: "如果部署了门户系统，设置URL或者路径。将会覆盖配置文件。空字符串等价于未设置", default: "" }),
};

const config = envConfig(specs, process.env);

const buildRuntimeConfig = async (phase) => {

  const building = phase === PHASE_PRODUCTION_BUILD;
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  const production = phase === PHASE_PRODUCTION_SERVER;

  // load .env.build if in build
  if (building) {
    require("dotenv").config({ path: "env/.env.build" });
  }

  if (dev) {
    require("dotenv").config({ path: "env/.env.dev" });
  }

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  // load clusters.json


  const basePath = production ? undefined : join(__dirname, "config");

  const clusters = getClusterConfigs(basePath);
  const clusterTexts = getConfigFromFile(ClusterTextsConfigSchema, ClusterTextsConfigName, false, basePath);
  const uiConfig = getConfigFromFile(UiConfigSchema, UI_CONFIG_NAME, true, basePath);
  const misConfig = getConfigFromFile(MisConfigSchema, MIS_CONFIG_NAME, false, basePath);

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
  };

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {
    ENABLE_CREATE_USER: capabilities.createUser,
    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,
    PREDEFINED_CHARGING_TYPES: misConfig.predefinedChargingTypes,

    CLUSTERS: Object.keys(clusters).reduce((prev, curr) => {
      prev[curr] = clusters[curr].displayName;
      return prev;
    }, {}),

    ACCOUNT_NAME_PATTERN: misConfig.accountNamePattern?.regex,
    ACCOUNT_NAME_PATTERN_MESSAGE: misConfig.accountNamePattern?.errorMessage,

    PORTAL_URL: config.PORTAL_URL || misConfig.portalUrl,
  };

  if (!building) {
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
}
