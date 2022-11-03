import { envConfig, host, num, port, str } from "@scow/config";
import { getKeyPair } from "@scow/lib-ssh";
import { homedir } from "os";
import { join } from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥路径", default: join(homedir(), ".ssh", "id_rsa") }),
  SSH_PUBLIC_KEY_PATH: str({ desc: "SSH公钥路径", default: join(homedir(), ".ssh", "id_rsa.pub") }),

  DOWNLOAD_CHUNK_SIZE: num({ desc: "grpc下载文件时，每个message中的chunk的大小。单位字节", default: 3 * 1024 * 1024 }),
});

export const rootKeyPair = getKeyPair(config.SSH_PRIVATE_KEY_PATH, config.SSH_PUBLIC_KEY_PATH);
