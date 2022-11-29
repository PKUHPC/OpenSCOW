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

import { mockApi } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { delay } from "src/utils/delay";

import { api as realApi } from "./api";

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
      const promise = new Promise((res) => {
        console.log(`Calling API ${fn.name}, args ${JSON.stringify(args)}`);
        delay(500).then(() => res(fn(...args)));
      });
      // @ts-ignore
      promise.httpError = () => { return promise; };
      return promise;
    };

    mockApi[k] = newFn;
  }
}

// changing this line during development to set USE_MOCK dynamically

// judge whether USE_MOCK here can help reduce the size of bundle
// by tree shaking mock modules at production build
// @ts-ignore
export const api: typeof realApi = USE_MOCK ? { ...realApi, ...mockApi } : realApi;
