import { envConfig, getDocFromSpec, host, parsePlaceholder, portOrZero, regex, str } from "src/envConfig";

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

it("accepts 0 for portOrZero", async () => {

  const key = "TEST";

  process.env[key] = "0";

  const config = envConfig({
    [key]: portOrZero({ desc: "test port or zero " }),
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

it.each([
  [{
    TEST: regex({ desc: "regex" }),
    STR: str({ desc: "str", choices: ["123", "456"]}),
    HOST: host({ desc: "host", default: "1" }),
  }, `
| 名字 | 类型 | 描述 | 默认值 |
| -- | -- | -- | -- |
|\`TEST\`|正则表达式|regex|**必填**|
|\`STR\`|字符串|str<br/>可选项：123,456|**必填**|
|\`HOST\`|主机名|host|1|
`],
])("test doc generator", (spec, expected) => {
  expect(getDocFromSpec(spec)).toBe(expected);
});
