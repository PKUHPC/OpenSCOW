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

import { Entity, ManyToOne, PrimaryKey, Property, type Ref } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE, toRef } from "src/server/utils/orm";

import { Algorithm } from "./Algorithm";

@Entity()
export class AlgorithmVersion {
  @PrimaryKey()
    id!: number;

  @Property()
    versionName: string;

  @Property({ nullable: true })
    versionDescription?: string;

  @Property()
    privatePath: string;

  // 这里是提交作业时可以使用的path，当没有被分享时，path=privatePath
  @Property()
    path: string;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP })
    createTime?: Date;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() })
    updateTime?: Date;

  @Property()
    isShared: boolean;

  @ManyToOne(() => "Algorithm")
    algorithm: Ref<Algorithm>;

  constructor(init: {
      versionName: string;
      versionDescription?: string;
      path: string;
      privatePath: string;
      isShared?: boolean;
      algorithm: Algorithm;
      createTime?: Date;
      updateTime?: Date;
    }) {

    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.path = init.path;
    this.privatePath = init.privatePath;
    this.isShared = init.isShared || false;
    this.algorithm = toRef(init.algorithm);

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }
  }
}
