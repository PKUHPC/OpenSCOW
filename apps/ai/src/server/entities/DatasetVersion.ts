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

import { EntitySchema, type Ref } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE, toRef } from "src/server/utils/orm";

import { SharedStatus } from "./AlgorithmVersion";
import { Dataset } from "./Dataset";

export class DatasetVersion {
  id!: number;
  versionName: string;
  versionDescription?: string;
  privatePath: string;

  // 这里是提交作业时可以使用的path，当没有被分享时，path=privatePath
  path: string;

  createTime?: Date;
  updateTime?: Date;
  sharedStatus: SharedStatus;
  dataset!: Ref<Dataset>;

  constructor(init: {
    versionName: string;
    versionDescription?: string;
    privatePath: string;
    path: string;
    createTime?: Date;
    sharedStatus?: SharedStatus;
    dataset: Dataset;
    updateTime?: Date;
  }) {

    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.privatePath = init.privatePath;
    this.path = init.path;
    this.sharedStatus = init.sharedStatus || SharedStatus.UNSHARED;
    this.dataset = toRef(init.dataset);

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }

  }
}

export const datasetVersionEntitySchema = new EntitySchema({
  class: DatasetVersion,
});

datasetVersionEntitySchema.addPrimaryKey("id", Number);
datasetVersionEntitySchema.addProperty("versionName", String);
datasetVersionEntitySchema.addProperty("versionDescription", String, { nullable: true });
datasetVersionEntitySchema.addProperty("privatePath", String);
datasetVersionEntitySchema.addProperty("path", String);
datasetVersionEntitySchema.addProperty("createTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP });
datasetVersionEntitySchema.addProperty("updateTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() });
datasetVersionEntitySchema.addProperty("sharedStatus", String);
datasetVersionEntitySchema.addManyToOne("dataset", "Dataset", {
  entity: () => Dataset, deleteRule: "cascade", ref: true });
