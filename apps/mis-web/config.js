// @ts-check

const { envConfig, str, bool, num, parseKeyValue, regex } = require("@scow/config");

const building = process.env.BUILDING;
const dev = process.env.NODE_ENV === "development";
const production = process.env.NODE_ENV === "production";

// load .env.build if in build
if (building) {
  require("dotenv").config({ path: "env/.env.build" });
}

if (dev) {
  require("dotenv").config({ path: "env/.env.dev" });
}


const specs = {

  SERVER_URL: str({ desc: "后端服务地址", default: "mis-server:5000" }),

  AUTH_EXTERNAL_URL: str({ desc: "认证服务外网地址", default: "/auth" }),
  AUTH_INTERNAL_URL: str({ desc: "认证服务内网地址", default: "http://auth:5000" }),

  PREDEFINED_CHARGING_TYPES: str({ desc: "预定义的充值类型，格式：类型,类型,类型", default: "" }),
  ENABLE_CREATE_USER: bool({ desc: "是否支持用户不存在的时候创建用户", default: false }),
  ENABLE_CHANGE_PASSWORD: bool({ desc: "是否支持用户更改自己的密码", default: false }),

  ACCOUNT_NAME_PATTERN: regex({ desc: "账户名的正则规则", default: undefined }),
  ACCOUNT_NAME_PATTERN_MESSAGE: str({ desc: "创建账户名时如果账户名不符合规则显示什么。如果ACCOUNT_NAME_PATTERN没有设置，这个不生效", default: undefined }),

  DEFAULT_FOOTER_TEXT: str({ desc: "默认footer文本", default: "" }),
  FOOTER_TEXTS: str({ desc: "根据域名(hostname，不包括port)不同，显示在footer上的文本。格式：域名=文本,域名=文本", default: "" }),

  DEFAULT_PRIMARY_COLOR: str({ desc: "默认主题色", default: "#9B0000" }),
  PRIMARY_COLORS: str({ desc: "根据域名(hostname，不包括port)不同，应用的primary color。格式：域名=颜色,域名=颜色", default: "" }),

  PORTAL_PATH: str({ desc: "门户系统链接。如果不设置，则不显示到门户的链接", default: undefined }),
};

const config = envConfig(specs, process.env);

// load clusters.json
const { getConfigFromFile } = require("@scow/config");
const { clustersConfig } = require("@scow/config/build/appConfig/clusters");
const { clusterTextsConfig } = require("@scow/config/build/appConfig/clusterTexts");
const fs = require("fs");
const path = require("path");

/**
 * @type {import("@scow/config/build/appConfig/clusters").Clusters}
 */
const clusters = getConfigFromFile(clustersConfig.schema, clustersConfig.name, false,
  production ? undefined : path.join(__dirname, "config"))

/**
 * @type {import("@scow/config/build/appConfig/clusterTexts").ClusterTexts}
 */
const clusterTexts = getConfigFromFile(clusterTextsConfig.schema, clusterTextsConfig.name, false,
  production ? undefined : path.join(__dirname, "config"));

/**
 * @type {import ("./src/utils/config").ServerRuntimeConfig}
 */
const serverRuntimeConfig = {
  AUTH_EXTERNAL_URL: config.AUTH_EXTERNAL_URL,
  AUTH_INTERNAL_URL: config.AUTH_INTERNAL_URL,
  CLUSTERS_CONFIG: clusters,
  CLUSTER_TEXTS_CONFIG: clusterTexts,
  DEFAULT_FOOTER_TEXT: config.DEFAULT_FOOTER_TEXT,
  DEFAULT_PRIMARY_COLOR: config.DEFAULT_PRIMARY_COLOR,
  FOOTER_TEXTS: parseKeyValue(config.FOOTER_TEXTS),
  PRIMARY_COLORS: parseKeyValue(config.PRIMARY_COLORS),
  SERVER_URL: config.SERVER_URL,
}

/**
 * @type {import("./src/utils/config").PublicRuntimeConfig}
 */
const publicRuntimeConfig = {

  ENABLE_CREATE_USER: config.ENABLE_CREATE_USER,
  ENABLE_CHANGE_PASSWORD: config.ENABLE_CHANGE_PASSWORD,
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
