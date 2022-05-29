import { envConfig, host, port, str } from "@scow/config";

export const TOKEN_COOKIE_HEADER = "SCOW_USER";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  AUTH_URL: str({ desc: "认证服务URL。一定要加协议(http://)", default: "http://auth:5000" }),

  USER_HOME: str({ desc: "用户的home目录的格式，用{userId}代替用户ID。示例：/nfs/{userId}" }),

});
