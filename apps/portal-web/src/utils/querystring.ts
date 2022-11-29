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

import { useRouter } from "next/router";

type QueryValue = string | string[] | null | undefined;

export function queryToString(input: QueryValue): string {
  return Array.isArray(input) ? input[input.length - 1] : (input ?? "");
}

export function queryToIntOrDefault(input: QueryValue, defaultValue: number): number;
export function queryToIntOrDefault(
  input: QueryValue, defaultValue?: undefined): number | undefined;
export function queryToIntOrDefault(
  input: QueryValue,
  defaultValue: number | undefined,
) {
  const i = queryToString(input);
  const n = Number.parseInt(i);
  return (!Number.isNaN(n) && n > 0) ? n : defaultValue;
}

export function queryToArray(input: QueryValue): string[] {
  return Array.isArray(input)
    ? input
    : (input === null || input === undefined)
      ? []
      : [input];
}

export function useQuerystring() {
  const router = useRouter();
  return router.query;
}
