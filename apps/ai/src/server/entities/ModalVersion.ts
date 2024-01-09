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
import { Modal } from "./Modal";

export class ModalVersion {
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
  modal!: Ref<Modal>;

  constructor(init: {
    versionName: string;
    versionDescription?: string;
    algorithmVersion?: string;
    path: string;
    privatePath: string;
    sharedStatus?: SharedStatus;
    modal: Modal;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.algorithmVersion = init.algorithmVersion;
    this.path = init.path;
    this.privatePath = init.privatePath;
    this.sharedStatus = init.sharedStatus || SharedStatus.UNSHARED;
    this.modal = toRef(init.modal);

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }

  }
}

export const modalVersionEntitySchema = new EntitySchema({
  class: ModalVersion,
});

modalVersionEntitySchema.addPrimaryKey("id", Number);
modalVersionEntitySchema.addProperty("versionName", String);
modalVersionEntitySchema.addProperty("versionDescription", String, { nullable: true });
modalVersionEntitySchema.addProperty("algorithmVersion", String, { nullable: true });
modalVersionEntitySchema.addProperty("privatePath", String);
modalVersionEntitySchema.addProperty("path", String);

modalVersionEntitySchema.addProperty("createTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP });

modalVersionEntitySchema.addProperty("updateTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() });
modalVersionEntitySchema.addProperty("sharedStatus", String);
modalVersionEntitySchema.addManyToOne("modal", "Modal", {
  entity: () => Modal, onDelete: "CASCADE", wrappedReference: true });
