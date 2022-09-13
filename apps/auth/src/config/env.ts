import { envConfig, host, port, str } from "@scow/config";

import { AuthType } from "./AuthType";

export const AUTH_EXTERNAL_URL = "/auth";
export const AUTH_REDIRECT_URL = "/api/auth/callback";
export const FAVICON_URL = "/api/icon?type=favicon";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  BASE_PATH: str({ desc: "认证系统部署地址的base path", default: "/" }),

  AUTH_TYPE: str({ desc: "认证类型。将会覆写配置文件", choices: Object.values(AuthType), default: undefined }),

  TEST_USERS: str({ desc: "测试用户，如果这些用户登录，将其ID改为另一个ID。格式：原用户ID=新用户ID,原用户ID=新用户ID。", default: "" }),

});

