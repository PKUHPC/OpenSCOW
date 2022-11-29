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

import { envConfig, omitConfigSpec, parsePlaceholder, port, regex, str } from "src/envConfig";

it.each([
  ["123", {}, "123"],
  ["123${a}123", {}, "123123"],
  ["123${a}123", { a: "4" }, "1234123"],
  ["123${a123_4}", { a123_4: "haha" }, "123haha"],
])("parses placeholder %o with object %o to %o", (str: string, obj: object, expected: string) => {
  expect(parsePlaceholder(str, obj)).toBe(expected);
});

it("return specs as _spec", async () => {
  const spec = { TEST: str({ desc: "123", default: "!23" }) };
  const obj = envConfig(spec);
  expect(obj._specs).toBe(spec);
});

it("accepts 0 for port", async () => {

  const key = "TEST";

  process.env[key] = "0";

  const config = envConfig({
    [key]: port({ desc: "test port or zero " }),
  });

  expect(config[key]).toBe(0);
});

it.each([
  ["a", true],
  ["a[0-9]+", true],
  ["a[0", false],
])("tests regex validator %o", async (rule, valid) => {


  const key = "TEST";
  process.env[key] = rule;

  const createConfig = () => envConfig({
    [key]: regex({ desc: "regex" }),
  });


  if (valid) {
    const config = createConfig();
    expect(config[key]).toBe(rule);
  } else {
    const mockExit = jest.spyOn(process, "exit").mockImplementation(() => ({ }) as never);
    createConfig();
    expect(mockExit).toHaveBeenCalled();
  }
});

it("removes _specs property from config object", async () => {

  const key = "TEST";
  process.env[key] = "asd";

  const config = envConfig({
    [key]: regex({ desc: "regex" }),
  });

  expect(omitConfigSpec(config)).toEqual({ [key]: process.env[key] });
});
