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

import { EntitySchema } from "@mikro-orm/core";
import { DATETIME_TYPE } from "src/utils/orm";

export class ApiKey {
  id!: number;
  name: string;
  appId: string;
  key: string;
  createdAt = new Date();
  updatedAt = new Date();

  constructor(init: {
    name: string;
    appId: string;
    key: string;
  }) {
    this.name = init.name;
    this.appId = init.appId;
    this.key = init.key;
  }
}

export const ApiKeySchema = new EntitySchema<ApiKey>({
  class: ApiKey,
  tableName: "api_keys", // 数据库表名
  properties: {
    id: { type: Number, primary: true },
    appId: { type: String, length: 255, nullable: false },
    name: { type: String, length: 255, nullable: false },
    key: { type: String, length: 255, nullable: false, unique: true },
    createdAt: { type: "date", columnType: DATETIME_TYPE },
    updatedAt: { type: "date", columnType: DATETIME_TYPE, onUpdate: () => new Date() },
  },
});
