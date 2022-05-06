import { envConfig, host, parseKeyValue,portOrZero, str } from "@scow/config";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: portOrZero({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  NODES: str({ desc: "节点ID=节点IP", example: "login01=login01,cn1=cn1" }),

  TURBOVNC_PATH: str({ desc: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥目录", default: path.join(homedir(), ".ssh", "id_rsa") }),

});

export const nodes: Record<string, string> = parseKeyValue(config.NODES);
