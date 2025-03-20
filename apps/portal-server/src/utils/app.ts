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

import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import { FixedValue } from "@scow/protos/build/portal/app";
import { join } from "path";
import { getAppConfigs } from "src/config/apps";

export function splitSbatchArgs(sbatchArgs: string) {
  const args = sbatchArgs.split(" -").map(function(x, index) {
    x = x.trim();
    return index === 0 ? x : "-" + x;
  });
  return args.filter((x) => x); // remove empty string in the array
}


export const getClusterAppConfigs = (cluster: string) => {

  const commonApps = getAppConfigs();

  const clusterAppsConfigs = getAppConfigs(join(DEFAULT_CONFIG_BASE_PATH, "clusters/", cluster));

  const apps = {} as Record<string, typeof commonApps[number]>;

  for (const [key, value] of Object.entries(commonApps)) {
    apps[key] = value;
  }

  for (const [key, value] of Object.entries(clusterAppsConfigs)) {
    apps[key] = value;
  }

  return apps;

};




interface FixedValueInput {
  value: string | number | undefined;
  hidden?: boolean
}
type OutputValue = FixedValue["value"];

export function convertAttributesFixedValue(input: FixedValueInput | undefined):
{ value: OutputValue; hidden: boolean } | undefined {
  if (input?.value === undefined) {
    return undefined;
  }

  const fixedValue: OutputValue =
    typeof input.value === "number"
      ? { $case: "number", number: input.value }
      : { $case: "text", text: input.value };

  return { value: fixedValue, hidden: input.hidden ?? false };
}

export function camelToSnakeCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, "$1_$2").toUpperCase();
}


export function convertToOneOfValue(value: string | number):
   { $case: "number", number: number } | { $case: "text", text: string } {
  if (typeof value === "number") {
    return { $case: "number", number: value };
  } else {
    return { $case: "text", text: value };
  }
}
