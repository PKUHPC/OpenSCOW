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

// src/trpc/router.ts
import { CreateFastifyContextOptions } from "@trpc/server/adapters/fastify";
import { Dataset } from "src/entities/Dataset";
import { z } from "zod";

import { t } from "../utils/trpc";

const datasetRouter = t.router({
  createDataset: t.procedure
    .input(z.object({
      name: z.string(),
      owner: z.string(),
      type: z.string(),
      scene: z.string(),
      description: z.string(),
    }))
    .query(async ({ input }) => {
      const { name, owner, type, scene, description } = input;

      // const results = await em.findOne(Dataset, { name });
      // if (results) {
      //   logger.warn(`Name ${name} already exists `);
      //   throw new ConnectError(`Name ${name} already exists `, Code.AlreadyExists);
      // }

      // const record = new Dataset({
      //   name, owner, type, scene, description,
      // });

      // await em.persistAndFlush(record);
      // return { id: record.id };
    }),
});

export const appRouter = t.router({
  dataset: datasetRouter,
});

export type AppRouter = typeof appRouter;

export const createContext = async ({
  req,
  res,
}:
CreateFastifyContextOptions) => {

};

