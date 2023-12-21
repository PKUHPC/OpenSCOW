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

// import { Framework } from "src/models/Algorithm";
import { Algorithm, Framework } from "src/server/entities/Algorithm";
import { Dataset } from "src/server/entities/Dataset";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const mockModals = [
  {
    id: 100,
    name: "aaa",
    description: "test1",
    algorithmName:"algorithmName",
    algorithmFramwork:"algorithmFramwork",
    owner:"aaa",
    createTime: "2023-04-15 12:30:45",
    versions: [1, 2],
  },
  {
    id: 101,
    name: "bbb",
    description: "test2",
    algorithmName:"algorithmName2",
    algorithmFramwork:"algorithmFramwork2",
    owner:"bbb",
    createTime: "2023-04-15 12:30:45",
    versions: [1],
  },
];

export const getModals = procedure
  .input(z.object({
    page: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
    nameOrDescription: z.string().optional(),
  }))
  .output(z.object({ items: z.array(z.any()), count: z.number() }))
  .query(async ({ input, ctx: { user } }) => {
    const orm = await getORM();
    console.log("user", user);
    // const [items, count] = await orm.em.findAndCount(Dataset, {
    //   owner: input.owner || undefined,
    //   name: input.name || undefined,
    //   type: input.type || undefined,
    //   description: input.description || undefined,
    // }, {
    //   limit: input.page || 10, // Default limit
    //   offset: input.pageSize || 0, // Default offset
    //   orderBy: { createTime: "desc" },
    // });

    // return { items, count };
    return { items: mockModals, count: 2 };
  });
