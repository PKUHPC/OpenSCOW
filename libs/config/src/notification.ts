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

export const NotificationConfigSchema = Type.Object({
  db: Type.Object({
    host: Type.String({ description: "数据库地址" }),
    port: Type.Integer({ description: "数据库端口" }),
    user: Type.String({ description: "数据库用户名" }),
    password: Type.Optional(Type.String({ description: "数据库密码" })),
    dbName: Type.String({ description: "数据库数据库名" }),
    debug: Type.Boolean({ description: "打开ORM的debug模式", default: false }),
  }),

  redis: Type.Optional(Type.Object({
    enabled: Type.Boolean({ description: "是否启用 redis" }),
    host: Type.String({ description: "Redis 地址" }),
    port: Type.Integer({ description: "Redis 端口" }),
    password: Type.Optional(Type.String({ description: "Redis 密码" })),
  })),

  scow: Type.Object({
    misServerUrl: Type.String({ description: "scow mis-server 地址", default: "mis-server:5000" }),
  }),

  noticeType: Type.Object({
    siteMessage: Type.Object({
      enabled: Type.Boolean({ description: "是否启用站内消息", default: true }),
    }),
    SMS: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用短信", default: false }),
    })),
    email: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用邮件", default: false }),
    })),
    officialAccount: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用公众号", default: false }),
    })),
    weCom: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用企业微信", default: false }),
    })),
    dingTalk: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用钉钉", default: false }),
    })),
    lark: Type.Optional(Type.Object({
      enabled: Type.Boolean({ description: "是否启用飞书", default: false }),
    })),
  }),

  messageBridge: Type.Optional(Type.Object({
    address: Type.String({ description: "地址", default: "http://message-bridge:3000" }),
  }, { description: "第三方消息发送组件" })),

  deleteExpiredMessages: Type.Object({
    // 默认每天凌晨 3 点执行一次
    cron: Type.String({ description: "删除消息的周期的cron表达式", default: "0 3 * * *" }),
  }),
});

const NOTIFICATION_CONFIG_NAME = "notification/config";

export type NotificationConfigSchema = Static<typeof NotificationConfigSchema>;

export const getNotificationConfig: GetConfigFn<NotificationConfigSchema> = (baseConfigPath) => {
  const config =
    getConfigFromFile(NotificationConfigSchema, NOTIFICATION_CONFIG_NAME, baseConfigPath ?? DEFAULT_CONFIG_BASE_PATH);

  return config;
};
