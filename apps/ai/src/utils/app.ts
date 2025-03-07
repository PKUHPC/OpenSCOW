import { IdPrivate } from "src/server/trpc/route/jobs/jobs";

export const getIdPrivate = (array: IdPrivate[]) =>
  array.reduce<{
    ids: number[];
    isPrivates: boolean[];
  }>(
    (acc, item) => {
      acc.ids.push(item.id);
      acc.isPrivates.push(item.isPrivate);
      return acc;
    },
    { ids: [], isPrivates: []},
  );
