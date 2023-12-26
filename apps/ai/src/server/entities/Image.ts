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

import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE } from "src/server/utils/orm";

export enum Source {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
};

@Entity()
export class Image {
  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    name: string;

  @Property()
    owner: string;

  @Property()
    source: Source;

  @Property()
    tags: string;

  @Property({ nullable: true })
    description?: string;

  @Property()
    clusterId: string;

  // 这里是上传镜像时的源文件path
  @Property()
    sourcePath: string;

  // 这里是提交作业时可以使用的真实镜像path，每次上传镜像一定对应一个真实的镜像path
  @Property()
    path: string;

  @Property()
    isShared: boolean;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP })
    createTime?: Date;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() })
    updateTime?: Date;

  constructor(init: {
      name: string;
      owner: string;
      source: Source;
      tags: string;
      description?: string;
      path: string;
      sourcePath: string;
      isShared?: boolean;
      clusterId: string;
      createTime?: Date;
      updateTime?: Date;
    }) {

    this.name = init.name;
    this.owner = init.owner;
    this.source = init.source;
    this.tags = init.tags;
    this.description = init.description;
    this.path = init.path;
    this.sourcePath = init.sourcePath;
    this.isShared = init.isShared || false;
    this.clusterId = init.clusterId;

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }
  }
}
