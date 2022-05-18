import fs from "fs";
import { withTmpFile } from "src/utils/tmp";

it("creates tmp file, and removes it afterwards", async () => {
  const filePath = await withTmpFile(async ({ fd, path }) => {
    console.log("created tmp file", path);
    const content = "content";

    expect(fs.existsSync(path)).toBeTrue();

    await fd.writeFile(content);

    expect(await fs.promises.readFile(path, { encoding: "utf-8" })).toBe(content);

    return path;
  });

  expect(fs.existsSync(filePath)).toBeFalse();
});
