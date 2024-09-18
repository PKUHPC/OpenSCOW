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

import { inferRouterOutputs } from "@trpc/server";
import { AppRouter } from "src/server/trpc/router";

export type ImageInterface = inferRouterOutputs<AppRouter>["image"]["list"]["items"][0];

export const SourceText: Record<string, string> = {
  INTERNAL: "本地文件",
  EXTERNAL: "远程镜像",
};

export enum Source {
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
};

export enum Status {
  CREATING = "CREATING",
  CREATED = "CREATED",
  FAILURE = "FAILURE",
}
