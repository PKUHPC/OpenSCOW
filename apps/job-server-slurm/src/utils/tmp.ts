import { randomUUID } from "crypto";
import fs from "fs";
import { FileHandle } from "fs/promises";
import os from "os";
import path from "path";

function getName() {
  return randomUUID();
}

// Why not existing node-tmp package?
// It depends on rimraf, which will not be installed during production
// I think it is a bug
export async function withTmpFile<T>(fn: (args: {path: string, fd: FileHandle}) => Promise<T>): Promise<T> {
  const file = getName();

  const filePath = path.join(os.tmpdir(), file);

  const fd = await fs.promises.open(filePath, "w+");

  return fn({ path: filePath, fd }).finally(() => fd.close());
}
