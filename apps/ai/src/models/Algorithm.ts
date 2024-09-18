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

export type AlgorithmInterface = inferRouterOutputs<AppRouter>["algorithm"]["getAlgorithms"]["items"][0];
export type AlgorithmVersionInterface = inferRouterOutputs<AppRouter>["algorithm"]["getAlgorithmVersions"]["items"][0];

export enum Framework {
  TENSORFLOW = "TENSORFLOW",
  PYTORCH = "PYTORCH",
  KERAS = "KERAS",
  MINDSPORE = "MINDSPORE",
  OTHER = "OTHER",
};

export const AlgorithmTypeText = {
  [Framework.TENSORFLOW]: "TensorFlow",
  [Framework.PYTORCH]: "PyTorch",
  [Framework.KERAS]: "Keras",
  [Framework.MINDSPORE]: "MindSpore",
  [Framework.OTHER]: "其他",
} as const;
