// @ts-check

const { envConfig, str, bool, parseKeyValue, num } = require("@scow/config");
const { join } = require("path");
const { homedir } = require("os");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } = require("next/constants");

const { getCapabilities } = require("@scow/lib-auth");
const { DEFAULT_PRIMARY_COLOR, getUiConfig } = require("@scow/config/build/appConfig/ui");
const { getPortalConfig } = require("@scow/config/build/appConfig/portal");
const { getAppConfigs } = require("@scow/config/build/appConfig/app");
const { getClusterConfigs } = require("@scow/config/build/appConfig/cluster");
const { getKeyPair, testRootUserSshLogin } = require("@scow/lib-ssh");
const pino = require("pino");
const os = require("os");

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

  BASE_PATH: str({ desc: "整个系统的base path", default: "/" }),

  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  LOGIN_NODES: str({ desc: "集群的登录节点。将会覆写配置文件。格式：集群ID=登录节点,集群ID=登录节点", default: "" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: join(homedir(), ".ssh", "id_rsa") }),
  SSH_PUBLIC_KEY_PATH: str({ desc: "SSH公钥路径", default: join(homedir(), ".ssh", "id_rsa.pub") }),

  PROXY_BASE_PATH: str({ desc: "网关的代理路径。相对于整个系统的base path。", default: "/proxy" }),

  MIS_DEPLOYED: bool({ desc: "是否部署了管理系统", default: false }),
  MIS_URL: str({ desc: "如果部署了管理系统，设置URL或者路径。相对于整个系统的base path。将会覆盖配置文件。空字符串等价于未部署管理系统", default: "" }),
};

// This config is used to provide env doc auto gen
const config = { _specs: specs };

const buildRuntimeConfig = async (phase) => {

  const logger = pino.default();

  const building = phase === PHASE_PRODUCTION_BUILD;
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  const production = phase === PHASE_PRODUCTION_SERVER;

  // load .env.build if in build
  if (building) {
    return { serverRuntimeConfig: {}, publicRuntimeConfig: {} };
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

  const uiConfig = getUiConfig(configPath);
  const portalConfig = getPortalConfig(configPath);

  const keyPair = getKeyPair(config.SSH_PRIVATE_KEY_PATH, config.SSH_PUBLIC_KEY_PATH);

  // test if the root user can ssh to login nodes
  if (production) {
    await Promise.all(Object.values(clusters).map(async ({ displayName, slurm: { loginNodes } }) => {
      const node = loginNodes[0];
      logger.info("Checking if root can login to %s by login node %s", displayName, node)
      const error = await testRootUserSshLogin(node, keyPair, logger);
      if (error) {
        logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node, error)
        throw error;
      } else {
        logger.info("Root can login to %s by login node %s", displayName, node)
      }
    }));
  }

  /**
   * @type {import("./src/utils/config").ServerRuntimeConfig}
   */
  const serverRuntimeConfig = {
    BASE_PATH: config.BASE_PATH,
    AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
    SSH_PRIVATE_KEY_PATH: config.SSH_PRIVATE_KEY_PATH,
    ROOT_KEY_PAIR: keyPair,
    CLUSTERS_CONFIG: clusters,
    PORTAL_CONFIG: portalConfig,
    DEFAULT_PRIMARY_COLOR,
    APPS: apps,
    // use os username in test
    MOCK_USER_ID: process.env.NODE_ENV === "test" ? os.userInfo().username : undefined,
    UI_CONFIG: uiConfig,
    LOGIN_NODES: parseKeyValue(config.LOGIN_NODES),
  };

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  const misUrlSetting = config.MIS_URL || portalConfig.misUrl;

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {

    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,

    ENABLE_SHELL: portalConfig.shell,

    ENABLE_JOB_MANAGEMENT: portalConfig.jobManagement,

    ENABLE_LOGIN_DESKTOP: portalConfig.loginDesktop.enabled,
    LOGIN_DESKTOP_WMS: portalConfig.loginDesktop.wms,

    ENABLE_APPS: portalConfig.apps,

    MIS_URL: config.MIS_DEPLOYED ? join(config.BASE_PATH, config.MIS_URL || portalConfig.misUrl || "") : undefined,

    DEFAULT_HOME_TEXT: portalConfig.homeText.defaultText,
    HOME_TEXTS: portalConfig.homeText.hostnameMap,
    DEFAULT_HOME_TITLE: portalConfig.homeTitle.defaultText,
    HOME_TITLES: portalConfig.homeTitle.hostnameMap,

    CLUSTERS_CONFIG: clusters,
    CLUSTERS: Object.entries(clusters).map(([id, { displayName }]) => ({ id, name: displayName })),

    APPS: Object.entries(apps).map(([id, { name }]) => ({ id, name })),

    SUBMIT_JOB_WORKING_DIR: portalConfig.submitJobDefaultPwd,

    PROXY_BASE_PATH: join(config.BASE_PATH, config.PROXY_BASE_PATH),
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
