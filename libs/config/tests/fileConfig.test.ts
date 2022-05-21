import { Static, Type } from "@sinclair/typebox";
import fs from "fs";
import { dump } from "js-yaml";
import path from "path";
import { getConfigFromFile } from "src/fileConfig";

const configName = "test";

const Schema = Type.Object({
  loaded: Type.String(),
});

const folderPath = path.join(__dirname, "configFileTest" + process.env.JEST_TEST_ID);

const exts = {
  yml: dump,
  yaml: dump,
  json: JSON.stringify,
};

type Ext = keyof typeof exts;

function createConfig(ext: Ext) {
  const obj: Static<typeof Schema> = { loaded: ext };

  const content = exts[ext](obj);

  fs.writeFileSync(path.join(folderPath, configName + "." + ext), content);
}

beforeEach(() => {
  fs.mkdirSync(folderPath);
});

afterEach(() => {
  fs.rmSync(folderPath, { recursive: true });
});

function runTest(createdFiles: readonly Ext[], expectedLoaded: Ext | undefined) {
  createdFiles.forEach(createConfig);

  const mustExists = expectedLoaded !== undefined;
  // @ts-ignore
  const obj = getConfigFromFile(Schema, configName, !mustExists, folderPath);

  if (mustExists) {
    expect(obj?.loaded).toBe(expectedLoaded);
  }
}

it.each([
  [["yml"], "yml"],
  [["yaml"], "yaml"],
  [["json"], "json"],
  [["yml", "yaml"], "yml"],
  [["yaml", "json"], "yaml"],
] as const)("creates %o, should load %o", async (createdExts: readonly Ext[], expectedLoaded: Ext) => {
  runTest(createdExts, expectedLoaded);
});


it("reports error if config not exist", async () => {
  expect(() => runTest([], "yml")).toThrow();
});

it("allows non exist", async () => {
  runTest([], undefined);
});
