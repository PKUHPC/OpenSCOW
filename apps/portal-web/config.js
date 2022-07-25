// @ts-check

const { envConfig, str, bool, parseKeyValue, num } = require("@scow/config");
const { join } = require("path");
const { homedir } = require("os");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } = require("next/constants");

const { getConfigFromFile } = require("@scow/config");
const { getCapabilities } = require("@scow/lib-auth");
const { UI_CONFIG_NAME, UiConfigSchema, DEFAULT_PRIMARY_COLOR } = require("@scow/config/build/appConfig/ui");
const { PORTAL_CONFIG_NAME, PortalConfigSchema } = require("@scow/config/build/appConfig/portal");
const { getAppConfigs } = require("@scow/config/build/appConfig/app");
const { getClusterConfigs } = require("@scow/config/build/appConfig/cluster");

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

  AUTH_EXTERNAL_URL: str({ desc: "认证服务外网地址", default: "/auth" }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  LOGIN_NODES: str({ desc: "集群的登录节点。将会覆写配置文件。格式：集群ID=登录节点,集群ID=登录节点", default: "" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: join(homedir(), ".ssh", "id_rsa") }),

  MOCK_USER_ID: str({ desc: "覆盖已登录用户的用户ID", default: undefined }),

  PROXY_BASE_PATH: str({ desc: "网关的代理路径", default: "/proxy" }),
};

// This config is used to provide env doc auto gen
const config = { _specs: specs };

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

  // reload config after envs are applied
  const config = envConfig(specs, process.env);

  // load clusters.json

  const configPath = production ? undefined : join(__dirname, "config");

  const clusters = getClusterConfigs(configPath);

  const apps = getAppConfigs(configPath);

  const uiConfig = getConfigFromFile(UiConfigSchema, UI_CONFIG_NAME, true, configPath);
  const portalConfig = getConfigFromFile(PortalConfigSchema, PORTAL_CONFIG_NAME, false, configPath);

  /**
   * @type {import("./src/utils/config").ServerRuntimeConfig}
   */
  const serverRuntimeConfig = {
    AUTH_EXTERNAL_URL: config.AUTH_EXTERNAL_URL,
    AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
    SSH_PRIVATE_KEY_PATH: config.SSH_PRIVATE_KEY_PATH,
    CLUSTERS_CONFIG: clusters,
    PORTAL_CONFIG: portalConfig,
    DEFAULT_PRIMARY_COLOR,
    APPS: apps,
    MOCK_USER_ID: config.MOCK_USER_ID,
    UI_CONFIG: uiConfig,
    LOGIN_NODES: parseKeyValue(config.LOGIN_NODES),
  };

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {

    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,

    CLUSTER_NAMES: Object.keys(clusters).reduce((prev, curr) => {
      prev[curr] = clusters[curr].displayName;
      return prev;
    }, {}),

    ENABLE_SHELL: portalConfig.shell,

    ENABLE_JOB_MANAGEMENT: portalConfig.jobManagement,

    ENABLE_LOGIN_DESKTOP: portalConfig.loginDesktop.enabled,
    LOGIN_DESKTOP_WMS: portalConfig.loginDesktop.wms,

    ENABLE_APPS: portalConfig.apps,

    MIS_PATH: portalConfig.misPath,

    DEFAULT_HOME_TEXT: portalConfig.homeText.defaultText,
    HOME_TEXTS: portalConfig.homeText.hostnameMap,
    DEFAULT_HOME_TITLE: portalConfig.homeTitle.defaultText,
    HOME_TITLES: portalConfig.homeTitle.hostnameMap,

    CLUSTERS_CONFIG: clusters,

    APPS: Object.entries(apps).map(([id, { name }]) => ({ id, name })),

    SUBMIT_JOB_WORKING_DIR: portalConfig.submitJobDefaultPwd,

    PROXY_BASE_PATH: config.PROXY_BASE_PATH,
  }

  if (!building) {
    console.log("Server Runtime Config", serverRuntimeConfig);
    console.log("Public Runtime Config", publicRuntimeConfig);
  }

  return {
    serverRuntimeConfig,
    publicRuntimeConfig,
  }
}

module.exports = {
  buildRuntimeConfig,
  config,
};
