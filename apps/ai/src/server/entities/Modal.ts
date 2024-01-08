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

import { Collection, EntitySchema } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE } from "src/server/utils/orm";

import { ModalVersion } from "./ModalVersion";

export class Modal {
  id!: number;
  name: string;
  owner: string;
  algorithmFramework?: string;
  algorithmName?: string;
  versions = new Collection<ModalVersion>(this);
  isShared?: boolean;
  description?: string;
  clusterId: string;
  createTime?: Date;
  updateTime?: Date;

  constructor(init: {
    name: string;
    owner: string;
    algorithmFramework?: string;
    algorithmName?: string;
    isShared?: boolean;
    description?: string;
    clusterId: string;
    createTime?: Date;
    updateTime?: Date;
  }) {
    this.name = init.name;
    this.owner = init.owner;
    this.algorithmFramework = init.algorithmFramework;
    this.algorithmName = init.algorithmName;
    this.isShared = init.isShared ?? false;
    this.description = init.description;
    this.clusterId = init.clusterId;

    if (init.createTime) {
      this.createTime = init.createTime;
    }

    if (init.updateTime) {
      this.updateTime = init.updateTime;
    }

  }
}

export const modalEntitySchema = new EntitySchema({
  class: Modal,
});

modalEntitySchema.addPrimaryKey("id", Number);
modalEntitySchema.addProperty("name", String);
modalEntitySchema.addProperty("owner", String);

modalEntitySchema.addProperty("algorithmFramework", String, {
  comment: "algorithm algorithmFramework", nullable: true });

modalEntitySchema.addProperty("algorithmName", String, {
  comment: "algorithm name", nullable: true });

modalEntitySchema.addOneToMany("versions", "ModalVersion", {
  entity: () => "ModalVersion", mappedBy: (mv) => mv.modal });

modalEntitySchema.addProperty("isShared", Boolean);
modalEntitySchema.addProperty("description", String, { nullable: true });
modalEntitySchema.addProperty("clusterId", String);

modalEntitySchema.addProperty("createTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP });

modalEntitySchema.addProperty("updateTime", Date, {
  columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() });
