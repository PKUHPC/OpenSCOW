import { envConfig, host, num, port, str } from "@scow/config";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  TURBOVNC_PATH: str({ desc: "TurboVNC的安装路径", default: "/opt/TurboVNC" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥目录", default: path.join(homedir(), ".ssh", "id_rsa") }),

  SAVED_JOBS_DIR: str({ desc: "将保存的作业保存到什么位置。相对于用户的家目录", default: "scow/savedJobs" }),
  APP_JOBS_DIR: str({ desc: "将交互式任务的信息保存到什么位置。相对于用户的家目录", default: "scow/appData" }),

  MAX_DISPLAY: num({ desc:"最大连接桌面数量", default: 3 }),

});


