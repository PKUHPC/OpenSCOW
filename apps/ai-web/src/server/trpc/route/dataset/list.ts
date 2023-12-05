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

// import { Dataset } from "src/server/entities/Dataset";
// import { withPageAssert } from "src/server/trpc/middleware/withPageAssert";
// import { NoteStatusFilter } from "src/server/trpc/type/common/NoteStatusFilter";
// import { NotesPageInput } from "src/server/trpc/type/input/NotesPageInput";
// import { NotesPageOutput } from "src/server/trpc/type/output/NotesPageOutput";
import { Dataset } from "src/server/entities/Dataset";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";

export const list = procedure
  // .use(withPageAssert)
  // .input(NotesPageInput)
  // .output(NotesPageOutput)
  .query(async ({ input, ctx }) => {
    // const { args } = input;
    // const { status } = input.filter;
    // const { orm } = ctx;
    const orm = await getORM();

    const [items, count] = await orm.em.findAndCount(Dataset, {}, {
      // limit: args.limit,
      // offset: args.offset,
      orderBy: { createTime: "desc" },
    });

    return { items, count };
  });
