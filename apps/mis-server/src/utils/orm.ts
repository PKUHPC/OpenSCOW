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
