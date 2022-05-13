import { bool, envConfig, host, parseKeyValue,portOrZero, str } from "@scow/config";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: portOrZero({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  LOGIN_NODES: str({ desc: "登录节点ID=登录节点地址", example: "login01=login01,login02=login02" }),
  COMPUTE_NODES: str({ desc: "计算节点ID=计算节点IP", example: "cn1=cn1,cn2=cn2" }),

  ENABLE_VNC: bool({ desc: "在所有节点上启动VNC服务", default: false }),
  TURBOVNC_PATH: str({ desc: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥目录", default: path.join(homedir(), ".ssh", "id_rsa") }),

});

export const LOGIN_NODES = parseKeyValue(config.LOGIN_NODES);
export const COMPUTE_NODES = parseKeyValue(config.COMPUTE_NODES);

export const ALL_NODES = { ...LOGIN_NODES, ...COMPUTE_NODES };
