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

import { Dataset } from "./Dataset";

@Entity()
export class DatasetVersion {
  @PrimaryKey()
    id!: number;

  @Property()
    versionName: string;

  @Property({ nullable: true })
    versionDescription: string | undefined;

  @Property()
    path: string;

  @Property({ nullable: true })
    sharedPath?: string;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP })
    createTime?: Date;

  @Property()
    isShared: boolean;

  @ManyToOne(() => "Dataset", { onDelete: "CASCADE", wrappedReference: true })
    dataset: Ref<Dataset>;

  constructor(init: {
      versionName: string;
      versionDescription?: string;
      path: string;
      sharedPath?: string;
      createTime?: Date;
      isShared?: boolean;
      dataset: Dataset;
    }) {

    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.path = init.path;
    this.sharedPath = init.sharedPath;
    this.isShared = init.isShared || false;
    this.dataset = toRef(init.dataset);

    if (init.createTime) {
      this.createTime = init.createTime;
    }
  }
}
