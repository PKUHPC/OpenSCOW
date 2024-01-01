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

import { AlgorithmVersion } from "./AlgorithmVersion";

export enum Framework {
  TENSORFLOW = "TENSORFLOW",
  PYTORCH = "PYTORCH",
  KERAS = "KERAS",
  MINDSPORE = "MINDSPORE",
  OTHER = "OTHER",
};

export class Algorithm {
  id!: number;

  name: string;

  owner: string;

  framework: Framework;

  versions = new Collection<AlgorithmVersion>(this);

  isShared: boolean;

  description?: string;
  clusterId: string;

  createTime?: Date;
  updateTime?: Date;

  constructor(init: {
      name: string;
      owner: string;
      framework: Framework;
      isShared?: boolean;
      description?: string;
      clusterId: string;
      createTime?: Date;
      updateTime?: Date;
    }) {

    this.name = init.name;
    this.owner = init.owner;
    this.framework = init.framework;
    this.isShared = init.isShared || false;
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

export const algorithmEntitySchema = new EntitySchema<Algorithm>({
  class: Algorithm,
  properties: {
    id: { type: "number", primary: true },
    owner: { type: "string" },
    name: { type: "string" },
    framework: { enum: true, items: () => Framework },
    versions: { reference: "1:m", entity: () => "AlgorithmVersion", mappedBy: "algorithm" },
    isShared: { type: "boolean" },
    description: { type: "string", nullable: true },
    clusterId: { type: "string" },
    createTime: { columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP },
    updateTime: { columnType: DATETIME_TYPE, defaultRaw: CURRENT_TIMESTAMP, onUpdate: () => new Date() },
  },
});
