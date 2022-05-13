import { envConfig, host, parseKeyValue, port, str } from "@scow/config";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  AUTH_URL: str({ desc: "认证服务地址。一定要加协议(http://)", default: "http://auth:5000" }),

  CLUSTERS: str({ desc: "集群名和地址。格式：集群名=对应登录节点地址,集群名=对应登录节点地址" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: path.join(homedir(), ".ssh", "id_rsa") }),

});

export const clusters: Record<string, string> = parseKeyValue(config.CLUSTERS);
