/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { EntitySchema } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE } from "src/server/utils/orm";

export enum Source {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
};

export enum Status {
  CREATED = "CREATED",
  CREATING = "CREATING",
  FAILURE = "FAILURE",
}

export class Image {
  id!: number;
  name: string;
  owner: string;
  source: Source;
  tag: string;
  description?: string;
  clusterId?: string;

  // 这里是上传镜像时的源文件path
  sourcePath?: string;

  // 这里是提交作业时可以使用的真实镜像path，每次上传镜像一定对应一个真实的镜像path
  path?: string;

  isShared: boolean;
  status: Status;
  createTime?: Date;
  updateTime?: Date;

  constructor(init: {
    name: string;
    owner: string;
    source: Source;
    tag: string;
    description?: string;
    path?: string;
    sourcePath?: string;
    isShared?: boolean;
    status: Status;
    clusterId?: string;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.name = init.name;
    this.owner = init.owner;
    this.source = init.source;
    this.tag = init.tag;
    this.description = init.description;
    this.path = init.path;
    this.sourcePath = init.sourcePath;
    this.isShared = init.isShared ?? false;
    this.status = init.status;
    this.clusterId = init.clusterId;

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }

  }
}

export const imageEntitySchema = new EntitySchema({
  class: Image,
});

imageEntitySchema.addPrimaryKey("id", Number);
imageEntitySchema.addProperty("name", String);
imageEntitySchema.addProperty("owner", String);
imageEntitySchema.addEnum("source", String, { items: () => Source });
imageEntitySchema.addProperty("tag", String);
imageEntitySchema.addUnique({
  properties: ["name", "tag", "owner"],
  name: "unique_name_tag_owner",
});
imageEntitySchema.addProperty("description", String, { nullable: true });
imageEntitySchema.addProperty("clusterId", String, { nullable: true });
imageEntitySchema.addProperty("sourcePath", String);
imageEntitySchema.addProperty("path", String, { nullable: true });
imageEntitySchema.addProperty("isShared", Boolean);
imageEntitySchema.addEnum("status", String, { items: () => Status });
imageEntitySchema.addProperty("createTime", Date, { columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP });
imageEntitySchema.addProperty("updateTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() });
