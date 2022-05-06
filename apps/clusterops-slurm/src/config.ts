import { envConfig, host, portOrZero, str } from "@scow/config";
import { homedir } from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: portOrZero({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),

  SLURM_NODE_URL: str({ desc: "slurm节点的地址", example: "192.168.2.3" }),
  SLURM_SCRIPT_PATH: str({ desc: "slurm脚本的路径", example: "/root/slurm.sh" }),

  MYSQL_PASSWORD: str({ desc: "slurm.sh所需要的数据库密码" }),
  BASE_PARTITIONS: str({ desc: "所有分区，以逗号分隔", example: "GPU,CPU" }),

  ASSOC_TABLE: str({ desc: "slurm数据库中保存用户账户关系(association)的表名", default: "pkuhpc_assoc_table" }),

  SSH_PRIVATE_KEY_PATH: str({ desc: "SSH私钥目录", default: path.join(homedir(), ".ssh", "id_rsa") }),

});
