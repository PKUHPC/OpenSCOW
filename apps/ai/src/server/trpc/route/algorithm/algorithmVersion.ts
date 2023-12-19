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

import { TRPCError } from "@trpc/server";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { getORM } from "src/server/lib/db/orm";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const mockAlgorithmVersions = [
  {
    id: 100,
    name: "aaa",
    owner: "demo_admin1",
    isShared: true,
    description: "test1",
    createTime: "2023-04-15 12:30:45",
    path:"",
  },
  {
    id: 101,
    name: "bbb",
    owner: "demo_admin2",
    isShared: false,
    description: "test2",
    createTime: "2023-04-15 12:22:45",
    path:"",
  },
];

export const getAlgorithmVersions = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/algorithmVersion/list/{id}",
      tags: ["algorithmVersion"],
      summary: "get algorithmVersion",
    },
  })
  .input(z.object({
    id: z.number(),
    limit: z.number().min(1).optional(),
    pageSize: z.number().min(0).optional(),
  }))
  .output(z.object({ versions: z.array(z.any()), count: z.number() }))
  .query(async ({ input }) => {
    // const orm = await getORM();
    // const [items, count] = await orm.em.findAndCount(DatasetVersion, {}, {
    //   limit: input.limit || 10, // Default limit
    //   offset: input.pageSize || 0, // Default offset
    //   orderBy: { createTime: "desc" },
    // });

    // return { items, count };
    return {
      versions:mockAlgorithmVersions,
      count:2,
    };
  });


// export const createDatasetVersion = procedure
//   .meta({
//     openapi: {
//       method: "POST",
//       path: "/datasetVersion/create",
//       tags: ["datasetVersion"],
//       summary: "Create a new datasetVersion",
//     },
//   })
//   .input(z.object({
//     versionName: z.string(),
//     path: z.string(),
//     versionDescription: z.string().optional(),
//     datasetId: z.number(),
//   }))
//   .output(z.object({ id: z.number() }))
//   .mutation(async ({ input }) => {
//     const orm = await getORM();
//     // const datasetVersion = new DatasetVersion(input);
//     // await orm.em.persistAndFlush(datasetVersion);
//     return { id : 1 };
//   });

// export const deleteDatasetVersion = procedure
//   .meta({
//     openapi: {
//       method: "DELETE",
//       path: "/datasetVersion/delete/{id}",
//       tags: ["datasetVersion"],
//       summary: "delete a new datasetVersion",
//     },
//   })
//   .input(z.object({ id: z.number() }))
//   .output(z.object({ successd: z.boolean() }))
//   .mutation(async ({ input }) => {
//     const orm = await getORM();
//     const datasetVersion = await orm.em.findOne(DatasetVersion, { id: input.id });
//     if (!datasetVersion) throw new Error("DatasetVersion not found");
//     await orm.em.removeAndFlush(datasetVersion);
//     return { successd: true };
//   });
