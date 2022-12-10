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

import { getPlaceholderTexts, parseArray, parseKeyValue, parsePlaceholder } from "src/parse";

it.each([
  ["123", {}, "123"],
  ["123{{ a }}123", {}, "123123"],
  ["123{{ a }}123", { a: "4" }, "1234123"],
  ["1{23{{ a123_4 }}", { a123_4: "haha " }, "1{23haha "],
  ["123{a}", { a: "haha" }, "123{a}"],
  ["123{{a}}", { a: "haha" }, "123{{a}}"],
  ["123{{a }}", { a: "haha" }, "123{{a }}"],
  ["123{{ a }}123{{ b }}{{ a }}", { a: "aaa", b: "bbb" }, "123aaa123bbbaaa"],
])("parses placeholder %p with %p to %p", (str: string, obj: object, expected: string) => {
  expect(parsePlaceholder(str, obj)).toBe(expected);
});

it.each([
  ["", {}],
  ["test=t", { test: "t" }],
  ["t_est=t_123", { t_est: "t_123" }],
  ["t_est=t_123,a=b", { t_est: "t_123", a: "b" }],
  ["a=b, a=c", { a: "c" }],
  ["a=,b=2", { a: "", b: "2" }],
  ["  a = bbb   , cc = dddf ", { a: "bbb", cc: "dddf" }],
])("parses kv %p to %p", async (input: string, expected: object) => {
  expect(parseKeyValue(input)).toEqual(expected);
});

it.each([
  ["", []],
  ["asd", ["asd"]],
  ["abs,sd", ["abs", "sd"]],
  ["abs,sd,", ["abs", "sd", ""]],
])("parses array %p to %p", (input: string, expected: string[]) => {
  expect(parseArray(input)).toEqual(expected);
});

it.each([
  ["", []],
  ["{{ abc }}", ["abc"]],
  ["{{ abc }} dd {{ def }}", ["abc", "def"]],
  ["{{ abc }}dd{{ def }}", ["abc", "def"]],
  ["{{ abc}} dd {{ def }}", ["def"]],
  ["{abc }} dd {{def }}", []],
  ["123", []],
  ["123{{ abc }}456", ["abc"]],
  ["123{{abc }}456", []],
  ["123{{abc}}456", []],
  ["123{ abc }456", []],
  ["123{ abc }456", []],
])("from %p get texts %p", async (input: string, expected: string[]) => {
  expect(getPlaceholderTexts(input)).toEqual(expected);
});