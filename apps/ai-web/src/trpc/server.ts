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

import type { Caller } from "src/server/trpc/router";
import { router } from "src/server/trpc/router";

interface CallerImplementation<TResult, TArgs extends readonly unknown[]> {
  (trpc: Caller, ...args: TArgs): TResult
}

interface DecoratedCaller<TResult, TArgs extends readonly unknown[]> {
  (...args: TArgs): TResult
}

/**
 * Wraps a tRPC procedure caller with proper Next.js 13 error handling.
 *
 * Catches `NOT_FOUND` errors and shows 404 page.
 *
 * @param caller A function that executes tRPC query
 */
export function createCaller<TResult, TArgs extends readonly unknown[]>(
  caller: CallerImplementation<TResult, TArgs>,
): DecoratedCaller<TResult, TArgs> {
  const trpc = router.createCaller({});

  return function decoratedCaller(...args: TArgs): TResult {
    return caller(trpc, ...args);
  };
}
