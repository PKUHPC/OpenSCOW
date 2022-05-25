import { IdentifiedReference, Reference, wrap } from "@mikro-orm/core";

export const paginationProps = (page?: number, pageSize: number = 10) => ({
  offset: ((page ?? 1) - 1) * pageSize,
  limit: pageSize,
});

export type EntityOrRef<T> = T | IdentifiedReference<T>;

export function toRef<T>(t: EntityOrRef<T>): IdentifiedReference<T> {
  if (t instanceof Reference) {
    return t;
  } else {
    return Reference.create(t);
  }
}

export async function reloadEntity(entity: any) {
  await wrap(entity).init();
}

export async function reloadEntities(entities: any[]) {
  await Promise.all(entities.map((e) => reloadEntity(e)));
}

export const DATETIME_TYPE = "DATETIME(6)";
