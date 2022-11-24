import { envConfig, host, port, str } from "@scow/lib-config";
import { join } from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 80, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  AUTH_INTERNAL_URL: str({ desc: "认证系统地址", default: "http://auth:5000" }),

  BASE_PATH: str({ desc: "整个系统部署的base path", default: "/" }),

  PORTAL_PATH: str({ desc: "门户系统的部署路径，设置为空为不部署", default: "" }),
  PORTAL_INTERNAL_URL: str({ desc: "门户系统在内网中的路径", default: "http://portal-web:3000" }),

  MIS_PATH: str({ desc: "管理系统的部署路径，设置为空为不部署", default: "" }),
  MIS_INTERNAL_URL: str({ desc: "管理系统在内网中的路径", default: "http://mis-web:3000" }),

});

export const basePaths = {
  authPublic: join(config.BASE_PATH, "/auth/public"),
  portal: config.PORTAL_PATH ? join(config.BASE_PATH, config.PORTAL_PATH) : undefined,
  mis: config.MIS_PATH ? join(config.BASE_PATH, config.MIS_PATH) : undefined,
};

