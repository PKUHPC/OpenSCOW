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

function runTest(createdFiles: Ext[], expectedLoaded: Ext | undefined) {
  createdFiles.forEach(createConfig);

  const obj = getConfigFromFile(Schema, configName, false, folderPath);

  if (expectedLoaded) {
    expect(obj.loaded).toBe(expectedLoaded);
  }
}

function defineTest(createdFiles: Ext[], expectedLoaded: Ext) {

  it(`create ${createdFiles.join(", ")} and should load ${expectedLoaded}`, () => {
    runTest(createdFiles, expectedLoaded);
  });
}

defineTest(["yml"], "yml");
defineTest(["yaml"], "yaml");
defineTest(["json"], "json");
defineTest(["yml", "yaml"], "yml");
defineTest(["yaml", "json"], "yaml");

it("reports error if config not exist", async () => {
  expect(() => runTest([], "yml")).toThrow();
});

it("allows non exist", async () => {
  runTest([], undefined);
});
