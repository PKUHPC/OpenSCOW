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

import { IdentifiedReference, Reference } from "@mikro-orm/core";
import { EntityManager } from "@mikro-orm/mysql";

export const paginationProps = (page?: number, pageSize: number = 10) => ({
  offset: ((page ?? 1) - 1) * pageSize,
  limit: pageSize,
});

export type EntityOrRef<T> = T | IdentifiedReference<T>;

export function toRef<T extends {}>(t: EntityOrRef<T>): IdentifiedReference<T> {
  if (t instanceof Reference) {
    return t;
  } else {
    return Reference.create(t);
  }
}

export async function reloadEntity(em: EntityManager, entity: any) {
  await em.refresh(entity);
}

export async function reloadEntities(em: EntityManager, entities: any[]) {
  await Promise.all(entities.map((e) => reloadEntity(em, e)));
}

export const DATETIME_TYPE = "DATETIME(6)";
