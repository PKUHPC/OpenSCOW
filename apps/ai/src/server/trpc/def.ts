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

import { initTRPC } from "@trpc/server";
import Superjson from "superjson";
import { OpenApiMeta } from "trpc-openapi";

import type { GlobalContext } from "./context";

export const trpc = initTRPC.context<GlobalContext>()
  .meta<OpenApiMeta>()
  .create({
    transformer: Superjson,
  });

export const { middleware, procedure, router, mergeRouters } = trpc;

