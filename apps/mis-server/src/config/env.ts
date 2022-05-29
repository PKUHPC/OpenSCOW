import { bool, envConfig, host, num, parseKeyValue, port, str  } from "@scow/config";
import os from "os";
import path from "path";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 5000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),
  DB_HOST: host({ desc: "数据库地址" }),
  DB_PORT: port({ desc: "数据库端口" }),
  DB_USER: str({ desc: "数据库用户名" }),
  DB_PASSWORD: str({ desc: "数据库密码" }),
  DB_DBNAME: str({ desc: "数据库数据库名" }),
  DB_DEBUG: bool({ desc: "打开ORM的debug模式", default: false }),

  CLUSTERS: str({ desc: "集群名和地址。格式：集群名=对应管理器地址,集群名=对应管理器地址" }),

  AUTH_URL: str({ desc: "认证服务的地址。一定要加协议(http://)", default: "http://auth:5000" }),

  INSERT_SSH_KEY_WHEN_CREATING_USER: bool({ desc: "是否在创建用户后给用户插入登录所需要的SSH公钥",  default: false }),

  INSERT_SSH_KEY_LOGIN_NODES: str({
    desc: `
各个集群的其中一个登录节点的地址。集群中的存储应该是共享的，只要在一个登录节点上插入公钥就够了。
格式：集群ID=节点地址,集群ID=节点地址
    `,
    default: "",
  }),

  INSERT_SSH_KEY_PUBLIC_KEY_PATH: str({
    desc: "要插入的公钥的路径",
    default: path.join(os.homedir(), ".ssh/id_rsa.pub"),
  }),

  INSERT_SSH_KEY_PRIVATE_KEY_PATH: str({
    desc: "要插入的私钥的路径",
    default: path.join(os.homedir(), ".ssh/id_rsa"),
  }),

  // 获取作业信息的配置
  FETCH_JOBS_DB_HOST: host({ desc: "job_table数据库地址" }),
  FETCH_JOBS_DB_PORT: port({ desc: "job_table数据库端口" }),
  FETCH_JOBS_DB_USER: str({ desc: "job_table数据库用户名" }),
  FETCH_JOBS_DB_PASSWORD: str({ desc: "job_table数据库密码" }),
  FETCH_JOBS_DB_DBNAME: str({ desc: "job_table数据库名" }),
  FETCH_JOBS_DB_TABLE_NAME: str({ desc: "job_table中源数据所在的表名" }),

  FETCH_JOBS_START_INDEX: num({ desc: "从哪个biJobIndex开始获取数据", default: 0 }),
  FETCH_JOBS_BATCH_SIZE: num({
    desc: "为了防止一次性获取太多数据占用过多内存，每次获取的任务信息数量。如果一次需要获取的信息超过这个数字，那么将会连续多次获取",
    default: 100_000,
  }),
  FETCH_JOBS_PERIODIC_FETCH_ENABLED: bool({ desc: "是否启用周期性获取作业信息", default: true }),
  FETCH_JOBS_PERIODIC_FETCH_CRON: str({ desc: "获取信息的周期的cron表达式", default: "* * 1 * * *" }),

  JOB_PRICE_CHARGING_TYPE: str({ desc: "对作业计费时，发送给收费系统的付款类型", default: "作业费用" }),
  JOB_PRICE_CHANGE_CHARGING_TYPE: str({ desc: "修改作业费用时，发送给收费系统的付款/充值类型", default: "作业费用更改" }),

  JOB_CHARGE_COMMENT: str({
    desc: "给作业扣费时，扣费项的备注。可以使用{price}使用作业信息中的字段。字段参考src/entities/JobInfo",
    default: "集群: {cluster}，作业ID：{idJob}",
  }),

});

export const INSERT_SSH_KEY_LOGIN_NODES = parseKeyValue(config.INSERT_SSH_KEY_LOGIN_NODES);
