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

@Entity()
export class SystemState {
  @PrimaryKey()
    key: string;

  @Property()
    value: string;

  public static KEYS = {
    INITIALIZATION_TIME: "INITIALIZATION_TIME",
    UPDATE_SLURM_BLOCK_STATUS: "UPDATE_SLURM_BLOCK_STATUS",
  } as const;

  constructor(key: keyof typeof SystemState.KEYS, value: string) {
    this.key = key;
    this.value = value;
  }

}
