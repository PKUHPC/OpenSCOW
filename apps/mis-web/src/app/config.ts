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

import { getClusterConfigs } from "@scow/config/build/cluster";
import { getCommonConfig } from "@scow/config/build/common";
import { getUiConfig } from "@scow/config/build/ui";
import { USE_MOCK } from "src/apis/useMock";

const configBasePath = USE_MOCK ? "config" : undefined;

export const uiConfig = getUiConfig(configBasePath, console);
export const clustersConfig = getClusterConfigs(configBasePath, console);

export const commonConfig = getCommonConfig(configBasePath, console);

export const BASE_PATH = process.env.BASE_PATH || "/";

export const AUTH_INTERNAL_URL = process.env.AUTH_INTERNAL_URL!;

export const SERVER_URL = process.env.SERVER_URL!;

