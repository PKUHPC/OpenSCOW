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
import { Seeder } from "@mikro-orm/seeder";
import { internalMessageTypesMap } from "src/models/message-type";
import { NoticeType } from "src/models/notice-type";
import { AdminMessageConfig } from "src/server/entities/AdminMessageConfig";


export const AdminMessageConfigSeeder = () => class AdminMessageConfigSeeder extends Seeder {

  async run(em: SqlEntityManager): Promise<void> {
    // await em.getRepository(AdminMessageConfig).nativeDelete({}); // 清空表数据

    for (const messageType of internalMessageTypesMap.keys()) {

      const existingAdminMessageConfig = await em.findOne(AdminMessageConfig, {
        messageType, noticeType: NoticeType.SITE_MESSAGE });

      if (!existingAdminMessageConfig) {
        em.persist(
          new AdminMessageConfig({
            messageType,
            noticeType: NoticeType.SITE_MESSAGE,
            enabled: true,
            canUserModify: false,
          }),
        );
      }
    }

    await em.flush();
  }

};
