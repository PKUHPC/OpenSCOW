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

import { getSortedClusters } from "@scow/config/build/cluster";
import { USE_MOCK } from "src/utils/processEnv";
import { z } from "zod";

import { clusters } from "./config";

export async function mock<T>(actualFn: () => T, mockFn: () => T) {
  if (USE_MOCK) {
    return mockFn();
  } else {
    return actualFn();
  }
}

export const pagination = z.object({
  page: z.number(),
  pageSize: z.number().default(10),
});

export function clusterExist(clusterId: string) {
  return !!getSortedClusters(clusters).find((cluster) => cluster.id === clusterId);
}

export const booleanQueryParam =
() => z.union([z.literal("true"), z.literal("false")]).transform((arg) =>
  arg === "true",
);
