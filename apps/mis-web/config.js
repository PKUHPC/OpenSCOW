// @ts-check

const { envConfig, getConfigFromFile, parseKeyValue, regex, str } = require("@scow/config");
const { ClusterConfigSchema, getClusterConfigs } = require("@scow/config/build/appConfig/cluster");
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

  PREDEFINED_CHARGING_TYPES: str({ desc: "预定义的充值类型，格式：类型,类型,类型", default: "" }),

  ACCOUNT_NAME_PATTERN: regex({ desc: "账户名的正则规则", default: undefined }),
  ACCOUNT_NAME_PATTERN_MESSAGE: str({
    desc: "创建账户名时如果账户名不符合规则显示什么。如果ACCOUNT_NAME_PATTERN没有设置，这个不生效",
    default: undefined,
  }),

  PORTAL_PATH: str({ desc: "门户系统链接。如果不设置，则不显示到门户的链接", default: undefined }),
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

  const clusters = getClusterConfigs(production ? undefined : join(__dirname, "config"));

  /**
   * @type {import("@scow/config/build/appConfig/clusterTexts").ClusterTexts}
   */
  const clusterTexts = getConfigFromFile(ClusterTextsConfigSchema, ClusterTextsConfigName, false,
    production ? undefined : join(__dirname, "config"));

  const uiConfig = getConfigFromFile(UiConfigSchema, UI_CONFIG_NAME, true);

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
    PREDEFINED_CHARGING_TYPES: config.PREDEFINED_CHARGING_TYPES.split(",")
      .filter((x) => x)
      .map((x) => x.trim()),

    CLUSTERS: Object.keys(clusters).reduce((prev, curr) => {
      prev[curr] = clusters[curr].displayName;
      return prev;
    }, {}),

    ACCOUNT_NAME_PATTERN: config.ACCOUNT_NAME_PATTERN,
    ACCOUNT_NAME_PATTERN_MESSAGE: config.ACCOUNT_NAME_PATTERN_MESSAGE,

    PORTAL_PATH: config.PORTAL_PATH,
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
