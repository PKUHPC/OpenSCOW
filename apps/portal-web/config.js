// @ts-check

const { envConfig, str, bool, parseKeyValue, parseArray } = require("@scow/config");
const path = require("path");
const { homedir } = require("os");
const building = process.env.BUILDING;
const dev = process.env.NODE_ENV === "development"
const production = !building && process.env.NODE_ENV === "production";


// load .env.build if in build
if (building) {
  require("dotenv").config({ path: "env/.env.build" });
}

if (dev) {
  require("dotenv").config({ path: "env/.env.dev" });
}


const specs = {

  AUTH_EXTERNAL_URL: str({ desc: "认证服务外网地址", default: "/auth" }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  ENABLE_CHANGE_PASSWORD: bool({ desc: "是否支持用户更改自己的密码", default: false }),


  FILE_SERVERS: str({ desc: "启用文件管理功能的集群。格式：集群名,集群名。如果为空，则关闭文件管理的功能", default: "" }),

  ENABLE_JOB_MANAGEMENT: bool({ desc: "是否启动作业管理功能", default: false }),
  JOB_SERVER: str({ desc: "作业服务器的地址", default: "job-server:5000" }),

  ENABLE_VNC: bool({ desc: "是否启动VNC功能", default: false }),

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
  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: path.join(homedir(), ".ssh", "id_rsa") }),
};

const config = envConfig(specs, process.env);

// load clusters.json
const { getConfigFromFile, CONFIG_BASE_PATH } = require("@scow/config");
const { ClustersConfigName, ClustersConfigSchema } = require("@scow/config/build/appConfig/clusters");

const configPath = production ? undefined : path.join(__dirname, "config");

/**
 * @type {import("@scow/config/build/appConfig/clusters").Clusters}
 */
const clusters = getConfigFromFile(ClustersConfigSchema, ClustersConfigName, false, configPath);

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
};


function getApps() {
  // get available apps
  const fs = require("fs");
  const { APP_SERVER_CONFIG_BASE_PATH, AppServerConfigSchema } = require("@scow/config/build/appConfig/appServer");

  const appsPath = path.join(configPath || CONFIG_BASE_PATH, APP_SERVER_CONFIG_BASE_PATH);
  console.log(appsPath);

  if (!fs.existsSync(appsPath)) {
    return [];
  }

  const apps = fs.readdirSync(appsPath);

  return apps.map((filename) => {
    const info = getConfigFromFile(AppServerConfigSchema,
      path.join(APP_SERVER_CONFIG_BASE_PATH, path.basename(filename, path.extname(filename))), false, configPath);
    return { id: info.id, name: info.name };
  });
}

/**
 * @type {import("./src/utils/config").PublicRuntimeConfig}
 */
const publicRuntimeConfig = {

  ENABLE_CHANGE_PASSWORD: config.ENABLE_CHANGE_PASSWORD,

  CLUSTER_NAMES: Object.keys(clusters).reduce((prev, curr) => {
    prev[curr] = clusters[curr].displayName;
    return prev;
  }, {}),

  ENABLE_SHELL: config.ENABLE_SHELL,

  FILE_SERVERS: parseArray(config.FILE_SERVERS),

  ENABLE_JOB_MANAGEMENT: config.ENABLE_JOB_MANAGEMENT,
  ENABLE_VNC: config.ENABLE_VNC,

  MIS_PATH: config.MIS_PATH,

  DEFAULT_HOME_TEXT: config.DEFAULT_HOME_TEXT,
  HOME_TEXTS: parseKeyValue(config.HOME_TEXTS),
  DEFAULT_HOME_TITLE: config.DEFAULT_HOME_TITLE,
  HOME_TITLES: parseKeyValue(config.HOME_TITLES),

  CLUSTERS_CONFIG: clusters,

  APPS: getApps(),
}

if (!building) {
  console.log("Server Runtime Config", serverRuntimeConfig);
  console.log("Public Runtime Config", publicRuntimeConfig);
}

module.exports = {
  serverRuntimeConfig,
  publicRuntimeConfig,
  config,
};
