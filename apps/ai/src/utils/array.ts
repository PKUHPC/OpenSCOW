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

export function range(start = 1, end = 0, step = 1): number[] {
  const r = [] as number[];
  for (let i = start; i < end; i += step) {
    r.push(i);
  }
  return r;
}

export function flatten<T>(nestedArray: Array<T | Array<T>>): T[] {
  const result = [] as T[];
  for (const item of nestedArray) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  return result;
}

export function arrayContainsElement<T>(array: T[] | null | undefined): array is T[] {
  return !!array && array.length > 0;
}

export function removeNullOrUndefined<T>(array: (T | null | undefined)[]): T[] {
  return array.filter((x) => x !== undefined && x !== null) as T[];
}

export function removeNullOrUndefinedKey<T extends object>(object: T): T {
  for (const key in object) {
    if (object[key] === undefined || object[key] === null) {
      delete object[key];
    }
  }
  return object;
}
