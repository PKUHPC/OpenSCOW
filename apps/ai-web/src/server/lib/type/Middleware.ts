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

// import type { MaybePromise } from "lib/type/MaybePromise";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextHandler } from "next-connect";

export type MaybePromise<T> = T | Promise<T>

export interface Middleware {
  (
    req: NextApiRequest,
    res: NextApiResponse,
    next: NextHandler
  ): MaybePromise<unknown>
}
