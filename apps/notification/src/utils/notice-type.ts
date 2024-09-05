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

import { SqlEntityManager } from "@mikro-orm/mysql";
import { NoticeType } from "src/models/notice-type";
import { UserSubscription } from "src/server/entities/UserSubscription";

import { getMessageTypeAdminConfigsWithDefault } from "./message-config";

export const isValidNoticeType = (value: any): boolean => {
  const intValue = parseInt(value);
  if (isNaN(intValue)) {
    return false;
  }
  return Object.values(NoticeType).includes(intValue);
};

export async function getUserNotificationPreferences(em: SqlEntityManager, userId: string, messageType: string) {
  // 获取配置信息
  const adminMessageConfig = await getMessageTypeAdminConfigsWithDefault(em, messageType);

  const userPreferences = await Promise.all(
    adminMessageConfig.map(async (config) => {
      // 初始化 enabled 为配置中的默认值
      let enabled = config.enabled;

      // 如果管理员开启了且用户可以修改，则查找用户订阅
      if (enabled && config.canUserModify) {
        const noticeType = config.noticeType; // 强制转换类型
        const sub = await em.findOne(UserSubscription, { userId, messageType, noticeType });
        if (sub?.isSubscribed !== undefined) {
          enabled = sub.isSubscribed; // 如果用户有订阅记录，使用其值
        }
      }

      // 返回通知类型和是否启用的状态
      return { noticeType: config.noticeType, enabled };
    }),
  );

  return userPreferences.filter((type) => type.enabled).map((type) => type.noticeType);
}

