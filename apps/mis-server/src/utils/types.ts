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

import { JsonValue, NullValue } from "@scow/protos/build/server/charging";

export type AnyJson = boolean | number | string | null | JsonArray | JsonMap;
export interface JsonMap { [key: string]: AnyJson; }
interface JsonArray extends Array<AnyJson> {}

export type ValueOf<T> = T[keyof T];


// 根据类型转换为对应的 Protobuf message
export function convertMetadataMap(metadataValue: JsonMap): { [key: string]: JsonValue } {
  const convertedMap: { [key: string]: JsonValue } = {};

  for (const key in metadataValue) {
    if (metadataValue.hasOwnProperty(key)) {
      const value = metadataValue[key];
      convertedMap[key] = { value: undefined };

      if (typeof value === "string") {
        convertedMap[key].value = { $case: "stringValue", stringValue: value };
      } else if (typeof value === "number") {
        convertedMap[key].value = { $case: "numberValue", numberValue: value };
      } else if (typeof value === "boolean") {
        convertedMap[key].value = { $case: "boolValue", boolValue: value };
      }
      // JsonArray | JsonMap处理暂不涉及
      else {
        convertedMap[key].value = { $case: "nullValue", nullValue: NullValue };
      }
    }
  }

  return convertedMap;
}
