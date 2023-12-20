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

import { Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { CURRENT_TIMESTAMP, DATETIME_TYPE } from "src/server/utils/orm";

import { AlgorithmVersion } from "./AlgorithmVersion";

export enum Framework {
  TENSORFLOW = "TENSORFLOW",
  PYTORCH = "PYTORCH",
  KERAS = "KERAS",
  MINDSPORE = "MINDSPORE",
  OTHER = "OTHER",
};

@Entity()
export class Algorithm {
  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    name: string;

  @Property()
    owner: string;

  @Property()
    framework: Framework;

  @OneToMany(() => "AlgorithmVersion", (algorithmVersion: AlgorithmVersion) => algorithmVersion.algorithm)
    versions = new Collection<AlgorithmVersion>(this);

  @Property()
    isShared: boolean;

  @Property()
    description: string;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP })
    createTime?: Date;


  constructor(init: {
      name: string;
      owner: string;
      framework: Framework;
      isShared?: boolean;
      description?: string;
      createTime?: Date;
    }) {

    this.name = init.name;
    this.owner = init.owner;
    this.framework = init.framework;
    this.isShared = init.isShared || false;
    this.description = init.description || "";

    if (init.createTime) {
      this.createTime = init.createTime;
    }
  }

}
