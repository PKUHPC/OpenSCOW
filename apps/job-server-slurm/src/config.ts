import { bool, envConfig, getConfigFromFile, host, port, str } from "@scow/config";
import { clustersConfig as clustersConfigInfo } from "@scow/config/build/appConfig/clusters";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  ENABLE_VNC: bool({ desc: "在所有节点上启动VNC服务", default: false }),
  TURBOVNC_PATH: str({ desc: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥目录", default: path.join(homedir(), ".ssh", "id_rsa") }),

});

export const clustersConfig = getConfigFromFile(clustersConfigInfo.schema, clustersConfigInfo.name, false);

