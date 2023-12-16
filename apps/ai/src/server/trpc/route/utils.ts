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

import { USE_MOCK } from "src/utils/mock.js";
import { z } from "zod";

export async function mock<T>(actualFn: () => T, mockFn: () => T) {
  if (USE_MOCK) {
    // await new Promise((res) => setTimeout(res, ));
    return mockFn();
  } else {
    return actualFn();
  }
}

export const pagination = z.object({
  page: z.number(),
  pageSize: z.number().default(10),
});
