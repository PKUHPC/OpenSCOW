import { Static, Type } from "@sinclair/typebox";

export const SlurmMisConfigSchema = Type.Object({
  managerUrl: Type.String({ description: "slurm manager节点的URL" }),
  dbPassword: Type.String({ description: "slurmdbd的数据库密码" }),
  associationTableName: Type.String({ description: "user_association表名" }),
  scriptPath: Type.String({ description: "slurm.sh绝对路径" }),
}, { description: "slurm的MIS配置" });

export type SlurmMisConfigSchema = Static<typeof SlurmMisConfigSchema>;

export const MisConfigSchema = Type.Object({
  db: Type.Object({
    host: Type.String({ description: "数据库地址" }),
    port: Type.Integer({ description: "数据库端口" }),
    user: Type.String({ description: "数据库用户名" }),
    password: Type.String({ description: "数据库密码" }),
    dbName: Type.String({ description: "数据库数据库名" }),
    debug: Type.Boolean({ description: "打开ORM的debug模式", default: false }),
  }),

  authUrl: Type.String({ description: "认证服务的地址。一定要加协议(http://)", default: "http://auth:5000" }),

  portalUrl: Type.Optional(Type.String({ description: "如果部署了门户系统，设置门户系统的部署URL或者pathname" })),

  predefinedChargingTypes: Type.Array(Type.String(), { description: "预定义的充值类型", default: []}),

  accountNamePattern: Type.Optional(Type.Object({
    regex: Type.String({ description: "账户名的正则规则" }),
    errorMessage: Type.Optional(Type.String({ description: "如果账户名不符合规则显示什么" })),
  })),

  publicKeyPath: Type.Optional(Type.String({ description: "系统公钥的路径。默认为~/.ssh/id_rsa.pub" })),
  privateKeyPath: Type.Optional(Type.String({ description: "系统私钥的路径。默认为~/.ssh/id_rsa" })),

  insertSshKeyForNewUser: Type.Boolean({ description: "是否在创建用户后给用户插入登录所需要的SSH公钥",  default: true }),

  fetchJobs: Type.Object({
    db: Type.Object({
      host: Type.String({ description: "job_table数据库地址" }),
      port: Type.Integer({ description: "job_table数据库端口" }),
      user: Type.String({ description: "job_table数据库用户名" }),
      password: Type.String({ description: "job_table数据库密码" }),
      dbName: Type.String({ description: "job_table数据库名" }),
      tableName: Type.String({ description: "job_table中源数据所在的表名" }),
    }),

    startIndex: Type.Integer({ description: "从哪个biJobIndex开始获取数据", default: 0 }),
    batchSize: Type.Integer({
      description: "为了防止一次性获取太多数据占用过多内存，每次获取的任务信息数量。如果一次需要获取的信息超过这个数字，那么将会连续多次获取",
      default: 100_000,
    }),

    periodicFetch: Type.Object({
      enabled: Type.Boolean({ description:"是否默认打开", default: true }),
      cron: Type.String({ description: "获取信息的周期的cron表达式", default: "* * 1 * * *" }),
    }, { default: {} }),
  }),


  jobChargeType: Type.String({ description: "对作业计费时，计费费用的的付款类型", default: "作业费用" }),
  changeJobPriceType: Type.String({ description: "修改作业费用时所使用的付款/充值类型", default: "作业费用更改" }),

  jobChargeComment: Type.String({
    description: "给作业扣费时，扣费项的备注。可以使用{price}使用作业信息中的字段。字段参考src/entities/JobInfo",
    default: "集群: {cluster}，作业ID：{idJob}",
  }),
});

export const MIS_CONFIG_NAME = "mis";


