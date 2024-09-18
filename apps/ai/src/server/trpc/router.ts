/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { trpc } from "src/server/trpc/def";

import { accountRouter } from "./route/account";
import { algorithm } from "./route/algorithm";
import { auth } from "./route/auth";
import { config } from "./route/config";
import { dataset } from "./route/dataset";
import { file } from "./route/file";
import { image } from "./route/image";
import { jobsRouter } from "./route/jobs";
import { logo } from "./route/logo";
import { model } from "./route/model";

export const appRouter = trpc.router({
  dataset,
  image,
  auth,
  logo,
  config,
  algorithm,
  model,
  file,
  account: accountRouter,
  jobs: jobsRouter,
});

export type AppRouter = typeof appRouter;

export type Caller = ReturnType<typeof appRouter.createCaller>;
