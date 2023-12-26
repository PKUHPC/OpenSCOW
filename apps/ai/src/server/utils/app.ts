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

import { AppConfigSchema } from "@scow/config/build/appForAi";
import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import { createHash, randomBytes } from "crypto";
import { join } from "path";
import { getAiAppConfigs } from "src/config/apps"; ;


export const getClusterAppConfigs = (cluster: string) => {

  const commonApps = getAiAppConfigs();

  const clusterAppsConfigs = getAiAppConfigs(join(DEFAULT_CONFIG_BASE_PATH, "clusters/", cluster));

  const apps: Record<string, AppConfigSchema> = {};

  for (const [key, value] of Object.entries(commonApps)) {
    apps[key] = value;
  }

  for (const [key, value] of Object.entries(clusterAppsConfigs)) {
    apps[key] = value;
  }

  return apps;

};

export function generateRandomPassword(length: number) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  const bytes = randomBytes(length);

  for (let i = 0; i < length; i++) {
    result += characters.charAt(bytes[i] % charactersLength);
  }

  return result;
}

export function sha1WithSalt(password: string, salt: string) {
  const hash = createHash("sha1");
  hash.update(password + salt);
  return hash.digest("hex");
}
