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

import type { HttpError } from "@ddadaal/next-typed-api-routes-runtime";
import { mockApi } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { delay } from "src/utils/delay";

import { api as realApi } from "./api";

class MockPromise<T> implements PromiseLike<T> {

  constructor(
    private fn: (...args) => Promise<T>,
    private args: any[],
  ) {}

  errorHandlers = new Map<number, (e: HttpError) => any>();

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | null | undefined,
  ): PromiseLike<TResult1 | TResult2> {
    console.log(`Calling API ${this.fn.name}, args ${JSON.stringify(this.args)}`);
    return delay(500).then(() => {
      return this.fn(...this.args)
        .then((r) => {
          return onfulfilled?.(r);
        }).catch((e) => {
          if (this.errorHandlers.has(e.status)) {
            return this.errorHandlers.get(e.status)!(e.data);
          } else {
            console.log("Error occurred", e);
            throw e;
          }
        });
    });
  }

  httpError(code: number, handler: (e: HttpError) => any) {
    this.errorHandlers.set(code, handler);
    return this;
  }

}

if (USE_MOCK) {
  // filter out null mocks
  for (const k in mockApi) {
    const fn = mockApi[k];
    if (!fn) {
      delete mockApi[k];
      continue;
    }

    // add logging to the mock function
    const newFn = (...args: any) => {
      return new MockPromise(fn, args);
    };

    mockApi[k] = newFn;
  }
}

// changing this line during development to set USE_MOCK dynamically

// judge whether USE_MOCK here can help reduce the size of bundle
// by tree shaking mock modules at production build
// @ts-ignore
export const api: typeof realApi = USE_MOCK ? { ...realApi, ...mockApi } : realApi;
