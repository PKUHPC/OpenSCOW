// @ts-check

const { envConfig, str, bool, parseKeyValue, parseArray } = require("@scow/config");
const { join } = require("path");

const building = process.env.BUILDING;
const dev = process.env.NODE_ENV === "development"

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

  ENABLE_SHELL: bool({ desc: "是否启用Shell功能", default: false }),

  FILE_SERVERS: str({ desc: "启用文件管理功能的集群。格式：集群名,集群名。如果为空，则关闭文件管理的功能", default: "" }),

  JOB_SERVERS: str({ desc: "作业服务器的地址。格式：集群ID=地址,集群ID=地址", default: "" }),

  ENABLE_VNC: bool({ desc: "是否启动VNC功能", default: false }),

  DEFAULT_FOOTER_TEXT: str({ desc: "默认footer文本", default: "" }),
  FOOTER_TEXTS: str({ desc: "根据域名(hostname，不包括port)不同，显示在footer上的文本。格式：域名=文本,域名=文本", default: "" }),

  DEFAULT_PRIMARY_COLOR: str({ desc: "默认主题色", default: "#9B0000" }),
  PRIMARY_COLORS: str({ desc: "根据域名(hostname，不包括port)不同，应用的主题色。格式：域名=颜色,域名=颜色", default: "" }),

  MIS_PATH: str({ desc: "管理系统的链接。如果不设置，则不显示到管理系统的链接", default: undefined }),
};

const config = envConfig(specs, process.env);

// load clusters.json
const { getConfigFromFile } = require("@scow/config");
const { clustersConfig } = require("@scow/config/build/appConfig/clusters");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@scow/config/build/appConfig/clusters").Clusters}
 */
const clusters = (dev || building)
  ? JSON.parse(fs.readFileSync(path.resolve(__dirname, "config/clusters.json"), "utf-8"))
  : getConfigFromFile(clustersConfig.schema, clustersConfig.name);

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
  JOB_SERVERS: parseKeyValue(config.JOB_SERVERS),
};

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

  ENABLE_VNC: config.ENABLE_VNC,

  MIS_PATH: config.MIS_PATH,
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
