// @ts-check

const { envConfig, str, bool, parseKeyValue } = require("@scow/lib-config");
const { join } = require("path");
const { homedir } = require("os");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } = require("next/constants");

const { readVersionFile } = require("@scow/utils/build/version");
const { getCapabilities } = require("@scow/lib-auth");
const { DEFAULT_PRIMARY_COLOR, getUiConfig } = require("@scow/config/build/ui");
const { getPortalConfig } = require("@scow/config/build/portal");
const { getClusterConfigs } = require("@scow/config/build/cluster");
const { getCommonConfig } = require("@scow/config/build/common");

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

  AUTH_EXTERNAL_URL: str({ desc: "认证系统的URL。如果和本系统域名相同，可以只写完整路径", default: "/auth" }),

  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  LOGIN_NODES: str({ desc: "集群的登录节点。将会覆写配置文件。格式：集群ID=登录节点,集群ID=登录节点", default: "" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: join(homedir(), ".ssh", "id_rsa") }),
  SSH_PUBLIC_KEY_PATH: str({ desc: "SSH公钥路径", default: join(homedir(), ".ssh", "id_rsa.pub") }),

  PROXY_BASE_PATH: str({ desc: "网关的代理路径。相对于本系统的base path。", default: "/api/proxy/absolute" }),
  RPROXY_BASE_PATH: str({ desc: "网关的代理路径。相对于本系统的base path。", default: "/api/proxy/relative" }),
  WSPROXY_BASE_PATH: str({ desc: "网关的代理路径。相对于本系统的base path。", default: "/api/proxy/absolute" }),

  SERVER_URL: str({ desc: "门户后端的路径", default: "portal-server:5000" }),

  MOCK_USER_ID: str({ desc: "开发和测试的时候所使用的user id", default: undefined }),

  MIS_DEPLOYED: bool({ desc: "是否部署了管理系统", default: false }),
  MIS_URL: str({ desc: "如果部署了管理系统，管理系统的URL。如果和本系统域名相同，可以只写完整的路径。将会覆盖配置文件。空字符串等价于未部署管理系统", default: "" }),

  NOVNC_CLIENT_URL: str({ desc: "novnc客户端的URL。如果和本系统域名相同，可以只写完整路径", default: "/vnc" }),

  CLIENT_MAX_BODY_SIZE: str({ desc: "限制整个系统上传（请求）文件的大小，可接受的格式为nginx的client_max_body_size可接受的值", default: "1G" }),
};

const mockEnv = process.env.NEXT_PUBLIC_USE_MOCK === "1";

// This config is used to provide env doc auto gen
const config = { _specs: specs };

/**
 * Build system runtime config
 * @param {string} phase Next.js phase
 * @param {string} basePath basePath of the system
 * @returns RuntimeConfig
 */
const buildRuntimeConfig = async (phase, basePath) => {

  const building = phase === PHASE_PRODUCTION_BUILD;
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  const production = phase === PHASE_PRODUCTION_SERVER;
  const testenv = phase === PHASE_TEST;

  // load .env.build if in build
  if (building) {
    return { serverRuntimeConfig: {}, publicRuntimeConfig: {} };
  }

  if (dev) {
    require("dotenv").config({ path: "env/.env.dev" });
  }

  // reload config after envs are applied
  const config = envConfig(specs, process.env);

  const configPath = mockEnv ? join(__dirname, "config") : undefined;

  const clusters = getClusterConfigs(configPath);

  const uiConfig = getUiConfig(configPath);
  const portalConfig = getPortalConfig(configPath);
  const commonConfig = getCommonConfig(configPath);

  /**
   * @type {import("./src/utils/config").ServerRuntimeConfig}
   */
  const serverRuntimeConfig = {
    AUTH_EXTERNAL_URL: config.AUTH_EXTERNAL_URL,
    AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
    CLUSTERS_CONFIG: clusters,
    PORTAL_CONFIG: portalConfig,
    DEFAULT_PRIMARY_COLOR,
    MOCK_USER_ID: config.MOCK_USER_ID,
    UI_CONFIG: uiConfig,
    LOGIN_NODES: parseKeyValue(config.LOGIN_NODES),
    SERVER_URL: config.SERVER_URL,
    DEFAULT_HOME_TEXT: portalConfig.homeText.defaultText,
    HOME_TEXTS: portalConfig.homeText.hostnameMap,
    DEFAULT_HOME_TITLE: portalConfig.homeTitle.defaultText,
    HOME_TITLES: portalConfig.homeTitle.hostnameMap,
    SUBMIT_JOB_WORKING_DIR: portalConfig.submitJobDefaultPwd,
  };

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {

    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,

    ENABLE_SHELL: portalConfig.shell,

    ENABLE_JOB_MANAGEMENT: portalConfig.jobManagement,

    ENABLE_LOGIN_DESKTOP: portalConfig.loginDesktop.enabled,

    ENABLE_APPS: portalConfig.apps,

    MIS_URL: config.MIS_DEPLOYED ? (config.MIS_URL || portalConfig.misUrl) : undefined,

    CLUSTERS: Object.entries(clusters).map(([id, { displayName }]) => ({ id, name: displayName })),


    PROXY_BASE_PATH: join(basePath, config.PROXY_BASE_PATH),
    RPROXY_BASE_PATH: join(basePath, config.RPROXY_BASE_PATH),
    WSPROXY_BASE_PATH: join(basePath, config.WSPROXY_BASE_PATH),

    NOVNC_CLIENT_URL: config.NOVNC_CLIENT_URL,

    PASSWORD_PATTERN: commonConfig.passwordPattern?.regex,
    PASSWORD_PATTERN_MESSAGE: commonConfig.passwordPattern?.errorMessage,

    BASE_PATH: basePath,

    CLIENT_MAX_BODY_SIZE: config.CLIENT_MAX_BODY_SIZE,

    CROSS_CLUSTER_FILE_TRANSFER_ENABLED: Object.values(clusters).filter(cluster => cluster.crossClusterFilesTransfer.enabled).length > 1,
  }

  if (!building && !testenv) {
    console.log("Running @scow/portal-web");
    console.log("Version", readVersionFile());
    console.log("Server Runtime Config", serverRuntimeConfig);
    console.log("Public Runtime Config", publicRuntimeConfig);
  }

  if (!testenv) {

    // HACK
    // call /api/setup after 3 seconds to init the proxy and shell server
    setTimeout(() => {
      const url = `http://localhost:${process.env.PORT || 3000}${basePath === "/" ? "" : basePath}/api/setup`;
      console.log("Calling setup url to initialize proxy and shell server", url);
      fetch(url).then(async (res) => {
        console.log("Call completed. Response: ", await res.text());
      }).catch((e) => {
        console.error("Error when calling proxy url to initialize ws proxy server", e);
      });
    }, 3000);

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
