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

import { EntitySchema, type Ref } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE, toRef } from "src/server/utils/orm";

import { SharedStatus } from "./AlgorithmVersion";
import { Model } from "./Model";

export class ModelVersion {
  id!: number;
  versionName: string;
  versionDescription?: string;
  algorithmVersion?: string;
  privatePath: string;

  // 这里是提交作业时可以使用的path，当没有被分享时，path=privatePath
  path: string;

  createTime?: Date;
  updateTime?: Date;
  sharedStatus: SharedStatus;
  model!: Ref<Model>;

  constructor(init: {
    versionName: string;
    versionDescription?: string;
    algorithmVersion?: string;
    path: string;
    privatePath: string;
    sharedStatus?: SharedStatus;
    model: Model;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.algorithmVersion = init.algorithmVersion;
    this.path = init.path;
    this.privatePath = init.privatePath;
    this.sharedStatus = init.sharedStatus || SharedStatus.UNSHARED;
    this.model = toRef(init.model);

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }

  }
}

export const modelVersionEntitySchema = new EntitySchema({
  class: ModelVersion,
});

modelVersionEntitySchema.addPrimaryKey("id", Number);
modelVersionEntitySchema.addProperty("versionName", String);
modelVersionEntitySchema.addProperty("versionDescription", String, { nullable: true });
modelVersionEntitySchema.addProperty("algorithmVersion", String, { nullable: true });
modelVersionEntitySchema.addProperty("privatePath", String);
modelVersionEntitySchema.addProperty("path", String);

modelVersionEntitySchema.addProperty("createTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP });

modelVersionEntitySchema.addProperty("updateTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() });
modelVersionEntitySchema.addProperty("sharedStatus", String);
modelVersionEntitySchema.addManyToOne("model", "Model", {
  entity: () => Model, deleteRule: "cascade", ref: true });
