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

import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE } from "src/server/utils/orm";

import { Modal } from "./Modal";

@Entity()
export class ModalVersion {
  @PrimaryKey()
    id!: number;

  @Property()
    versionName: string;

  @Property()
    versionDescription: string;

  @Property()
    algorithmVersion: string;

  @Property()
    path: string;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP })
    createTime?: Date;

  @Property()
    isShared: boolean;

  @ManyToOne(() => "Modal")
    modal: Modal;

  constructor(init: {
      versionName: string;
      versionDescription: string;
      algorithmVersion: string;
      path: string;
      isShared: boolean;
      modal: Modal;
      createTime?: Date;
    }) {

    this.versionName = init.versionName;
    this.versionDescription = init.versionDescription;
    this.algorithmVersion = init.algorithmVersion;
    this.path = init.path;
    this.isShared = init.isShared;
    this.modal = init.modal;

    if (init.createTime) {
      this.createTime = init.createTime;
    }
  }
}
