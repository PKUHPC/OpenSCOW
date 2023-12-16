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

import type { CreateNextContextOptions } from "@trpc/server/adapters/next";
import type { NextApiRequest, NextApiResponse } from "next";

import { ClientUserInfo } from "../auth/models";


export type Context = object

export type SSRContext<R = any> = Context & {
  req: NextApiRequest
  res: NextApiResponse<R>
  user?: ClientUserInfo
}

export type GlobalContext = SSRContext

export function isSSRContext(
  ctx: GlobalContext,
): ctx is SSRContext {
  return !!((ctx as SSRContext)?.req && (ctx as SSRContext)?.res);
}

// export const createContext = (
//   ctx: CreateNextContextOptions,
// ): GlobalContext => isSSRContext(ctx) ? ctx : {};

export const createContext = (
  ctx: CreateNextContextOptions,
): GlobalContext => ctx;


