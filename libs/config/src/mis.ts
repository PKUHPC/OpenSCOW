/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { GetConfigFn, getConfigFromFile } from "@scow/lib-config";
import { Static, Type } from "@sinclair/typebox";
import { DEFAULT_CONFIG_BASE_PATH } from "src/constants";

export const SlurmMisConfigSchema = Type.Object({
  managerUrl: Type.String({ description: "slurm manager节点的URL" }),
  dbHost: Type.String({ description: "slurmdbd的数据库地址", default: "localhost" }),
  dbPort: Type.Integer({ description: "slurmdbd的数据库端口", default: 3306 }),
  dbUser: Type.String({ description: "slurmdbd的数据库的用户名", default: "root" }),
  dbPassword: Type.String({ description: "slurmdbd的数据库密码" }),
  slurmAcctDbName: Type.String({ description: "slurm accounting database的数据库名", default: "slurm_acct_db" }),
  clusterName: Type.String({ description: "这个集群在slurm中的集群名字" }),
  scriptPath: Type.String({ description: "slurm.sh绝对路径" }),
}, { description: "slurm的MIS配置" });

export type SlurmMisConfigSchema = Static<typeof SlurmMisConfigSchema>;

export enum JobTableType {
  mariadb = "mariadb",
  mysql = "mysql",
}

export const MisConfigSchema = Type.Object({
  db: Type.Object({
    host: Type.String({ description: "数据库地址" }),
    port: Type.Integer({ description: "数据库端口" }),
    user: Type.String({ description: "数据库用户名" }),
    password: Type.Optional(Type.String({ description: "数据库密码" })),
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

  createUser: Type.Object({
    enabled: Type.Boolean({ description: "是否启用用户从SCOW中创建用户", default: true }),

    type: Type.Union([Type.Literal("builtin"), Type.Literal("external")], {
      description: "用户创建方式", default: "builtin",
    }),

    external: Type.Optional(Type.Object({
      url: Type.String({ description: "创建用户的页面" }),
    }, { description: "通过外置页面创建用户时的配置。使用此配置无需认证系统支持创建用户" })),

    userIdPattern: Type.Optional(Type.Object({
      regex: Type.String({ description: "用户ID的正则规则" }),
      errorMessage: Type.Optional(Type.String({ description: "如果用户ID不符合规则显示什么" })),
    }, { deprecated: true, description: "请使用createUser.builtin.userIdPattern" })),

    builtin: Type.Optional(Type.Object({
      userIdPattern: Type.Optional(Type.Object({
        regex: Type.String({ description: "用户ID的正则规则" }),
        errorMessage: Type.Optional(Type.String({ description: "如果用户ID不符合规则显示什么" })),
      }, { description: "从管理系统里创建用户时，用户ID的验证规则" })),
    }, { default: {}, description: "通过内置页面创建用户时的配置。要使用内置页面，认证系统需要支持创建用户" })),
  }, { default: {}, description: "SCOW的创建用户相关配置" }),

  fetchJobs: Type.Object({
    db: Type.Object({
      host: Type.String({ description: "job_table数据库地址" }),
      port: Type.Integer({ description: "job_table数据库端口" }),
      user: Type.String({ description: "job_table数据库用户名" }),
      password: Type.String({ description: "job_table数据库密码" }),
      dbName: Type.String({ description: "job_table数据库名" }),
      tableName: Type.String({ description: "job_table中源数据所在的表名" }),
      type: Type.Enum(JobTableType, { description: "job_table数据库类型", default: JobTableType.mariadb }),
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
    description: "给作业扣费时，扣费项的备注。可以使用{{ 属性名 }}使用作业信息中的属性。字段参考src/entities/JobInfo",
    default: "集群: {{ cluster }}，作业ID：{{ idJob }}",
  }),

  navLinks: Type.Optional(Type.Array(
    Type.Object({ text: Type.String({ description: "一级导航名称" }), url: Type.String({ description: "一级导航链接" }),
      allowedRoles: Type.Optional(Type.Array(Type.String(), { description: "可以看到这个链接的用户" })),
      children: Type.Optional(Type.Array(
        Type.Object({ text: Type.String({ description: "二级导航名称" }), url: Type.String({ description: "二级导航链接" }),
          allowedRoles: Type.Optional(Type.Array(Type.String(), { description: "可以看到这个链接的用户" })),
        }))),
    })),
  ),

});

const MIS_CONFIG_NAME = "mis";

export type MisConfigSchema = Static<typeof MisConfigSchema>;

export const getMisConfig: GetConfigFn<MisConfigSchema> = (baseConfigPath, logger) => {
  const config = getConfigFromFile(MisConfigSchema, MIS_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

  if (config.createUser.type === "external" && !config.createUser.external) {
    throw new Error("createUser.external is required when createUser.type is external");
  }

  if (config.createUser.type === "builtin" && !config.createUser.builtin) {
    throw new Error("createUser.builtin is required when createUser.type is builtin");
  }

  if (config.createUser.type === "builtin"
  && config.createUser.userIdPattern && !config.createUser.builtin?.userIdPattern) {
    logger?.warn("createUser.userIdPattern is deprecated, please use createUser.builtin.userIdPattern");
  }

  return config;

};
