// @ts-check

const { envConfig, str, bool, parseKeyValue, num } = require("@scow/config");
const { join, basename, extname } = require("path");
const { homedir } = require("os");
const fs = require("fs");
const { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD, PHASE_PRODUCTION_SERVER, PHASE_TEST } = require("next/constants");

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

  AUTH_EXTERNAL_URL: str({ desc: "认证服务外网地址", default: "/auth" }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  ENABLE_JOB_MANAGEMENT: bool({ desc: "是否启动作业管理功能", default: false }),
  JOB_SERVER: str({ desc: "作业服务器的地址", default: "job-server:5000" }),

  ENABLE_LOGIN_DESKTOP: bool({ desc: "是否启动登录节点上的桌面功能", default: false }),
  LOGIN_DESKTOP_WMS: str({ desc: "登录节点上可以启动的桌面类型，格式：名字=wm值,名字=wm值", example: "Xfce=xfce,gnome3=", default: "Xfce=xfce" }),

  ENABLE_APPS: bool({ desc: "是否启动交互式任务功能", default: false }),

  DEFAULT_FOOTER_TEXT: str({ desc: "默认footer文本", default: "" }),
  FOOTER_TEXTS: str({ desc: "根据域名(hostname，不包括port)不同，显示在footer上的文本。格式：域名=文本,域名=文本", default: "" }),

  DEFAULT_HOME_TEXT: str({ desc: "默认主页文本", default: "北京大学计算中心成立于1963年，是集计算中心管理信息中心和网络中心于一体的实体单位，是独立建制的全校大型综合实验室，负责学校信息化基础设施的建设、开发与运行服务工作。" }),
  HOME_TEXTS: str({ desc: "根据域名(hostname，不包括port)不同，显示在主页上的文本。格式：域名=文本,域名=文本", default: "" }),

  DEFAULT_HOME_TITLE: str({ desc: "默认主页标题", default: "北京大学计算中心高性能计算平台交互式工具" }),
  HOME_TITLES: str({ desc: "根据域名(hostname，不包括port)不同，显示在主页上的标题。格式：域名=标题,域名=标题", default: "" }),

  DEFAULT_PRIMARY_COLOR: str({ desc: "默认主题色", default: "#9B0000" }),
  PRIMARY_COLORS: str({ desc: "根据域名(hostname，不包括port)不同，应用的主题色。格式：域名=颜色,域名=颜色", default: "" }),

  MIS_PATH: str({ desc: "管理系统的链接。如果不设置，则不显示到管理系统的链接", default: undefined }),

  ENABLE_SHELL: bool({ desc: "是否启用Shell功能", default: false }),
  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: join(homedir(), ".ssh", "id_rsa") }),

  SUBMIT_JOB_DEFAULT_PWD: str({ desc: "提交作业的默认工作目录。使用{name}代替作业名称。相对于用户的家目录", default: "scow/jobs/{name}" }),

  PROXY_BASE_PATH: str({ desc: "代理地址的根路径", default: "/proxy" }),

  FILE_SERVERS: str({ desc: "覆盖集群的文件管理服务器地址。如果一个集群不设置，将会使用集群配置文件中的loginNode", example: "集群ID=IP,集群ID=IP", default: "" }),

  MOCK_USER_ID: str({ desc: "覆盖已登录用户的用户ID", default: undefined }),

  TURBOVNC_PATH: str({ desc: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  SAVED_JOBS_DIR: str({ desc: "将保存的作业保存到什么位置。相对于用户的家目录", default: "scow/savedJobs" }),
  APP_JOBS_DIR: str({ desc: "将交互式任务的信息保存到什么位置。相对于用户的家目录", default: "scow/appData" }),

  MAX_LOGIN_DESKTOPS: num({ desc: "最大登录节点桌面数量", default: 3 }),
};

const config = envConfig(specs, process.env);

const buildRuntimeConfig = async (phase) => {
  const building = phase === PHASE_PRODUCTION_BUILD;
  const dev = phase === PHASE_DEVELOPMENT_SERVER;
  const production = phase === PHASE_PRODUCTION_SERVER;
  const test = phase === PHASE_TEST;

  // load .env.build if in build
  if (building) {
    require("dotenv").config({ path: "env/.env.build" });
  }

  if (dev) {
    require("dotenv").config({ path: "env/.env.dev" });
  }

  // load clusters.json
  const { getConfigFromFile, CONFIG_BASE_PATH } = require("@scow/config");
  const { ClustersConfigName, ClustersConfigSchema } = require("@scow/config/build/appConfig/clusters");

  const configPath = production ? undefined : join(__dirname, "config");

  /**
   * @type {import("@scow/config/build/appConfig/clusters").Clusters}
   */
  const clusters = getConfigFromFile(ClustersConfigSchema, ClustersConfigName, false, configPath);


  // get available apps
  function getApps() {
    const { APP_CONFIG_BASE_PATH, AppConfigSchema } = require("@scow/config/build/appConfig/app");

    const appsPath = join(configPath || CONFIG_BASE_PATH, APP_CONFIG_BASE_PATH);
    console.log(appsPath);

    if (!fs.existsSync(appsPath)) {
      return [];
    }

    const apps = fs.readdirSync(appsPath);

    return apps.map((filename) => {
      return getConfigFromFile(AppConfigSchema,
        join(APP_CONFIG_BASE_PATH, basename(filename, extname(filename))), false, configPath);
    });
  }

  const apps = getApps();

  /**
   * @type {import("./src/utils/config").ServerRuntimeConfig}
   */
  const serverRuntimeConfig = {
    AUTH_EXTERNAL_URL: config.AUTH_EXTERNAL_URL,
    AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
    DEFAULT_FOOTER_TEXT: config.DEFAULT_FOOTER_TEXT,
    DEFAULT_PRIMARY_COLOR: config.DEFAULT_PRIMARY_COLOR,
    FOOTER_TEXTS: parseKeyValue(config.FOOTER_TEXTS),
    PRIMARY_COLORS: parseKeyValue(config.PRIMARY_COLORS),
    JOB_SERVER: config.JOB_SERVER,
    SSH_PRIVATE_KEY_PATH: config.SSH_PRIVATE_KEY_PATH,
    CLUSTERS_CONFIG: clusters,
    FILE_SERVERS: parseKeyValue(config.FILE_SERVERS),
    APPS: apps,
    MOCK_USER_ID: config.MOCK_USER_ID,
    TURBOVNC_PATH: config.TURBOVNC_PATH,
    MAX_LOGIN_DESKTOPS: config.MAX_LOGIN_DESKTOPS,
    APP_JOBS_DIR: config.APP_JOBS_DIR,
    SAVED_JOBS_DIR: config.SAVED_JOBS_DIR,
  };

  // query auth capabilities to set optional auth features
  const capabilities = await queryCapabilities(config.AUTH_INTERNAL_URL, phase);

  /**
   * @type {import("./src/utils/config").PublicRuntimeConfig}
   */
  const publicRuntimeConfig = {

    ENABLE_CHANGE_PASSWORD: capabilities.changePassword,

    FILE_SERVERS_ENABLED_CLUSTERS: Object.keys(clusters).filter((x) => clusters[x].loginNodes.length > 0),

    CLUSTER_NAMES: Object.keys(clusters).reduce((prev, curr) => {
      prev[curr] = clusters[curr].displayName;
      return prev;
    }, {}),

    ENABLE_SHELL: config.ENABLE_SHELL,

    ENABLE_JOB_MANAGEMENT: config.ENABLE_JOB_MANAGEMENT,

    ENABLE_LOGIN_DESKTOP: config.ENABLE_LOGIN_DESKTOP,
    LOGIN_DESKTOP_WMS: parseKeyValue(config.LOGIN_DESKTOP_WMS),

    ENABLE_APPS: config.ENABLE_APPS,

    MIS_PATH: config.MIS_PATH,

    DEFAULT_HOME_TEXT: config.DEFAULT_HOME_TEXT,
    HOME_TEXTS: parseKeyValue(config.HOME_TEXTS),
    DEFAULT_HOME_TITLE: config.DEFAULT_HOME_TITLE,
    HOME_TITLES: parseKeyValue(config.HOME_TITLES),

    CLUSTERS_CONFIG: clusters,

    APPS: apps.map(({ id, name }) => ({ id, name })),

    SUBMIT_JOB_WORKING_DIR: config.SUBMIT_JOB_DEFAULT_PWD,

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
