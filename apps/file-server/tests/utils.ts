import FormData from "form-data";
import fs from "fs";
import { userInfo } from "os";
import path from "path";

jest.mock("@scow/lib-auth");

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TEST_USER, TOKEN } = require("@scow/lib-auth");

export const TEST_USER_UID = userInfo().uid;
export { TEST_USER, TOKEN };

console.log(TEST_USER, TOKEN);

export function removeGracefulShutdown() {

  process.removeAllListeners("SIGTERM");
  process.removeAllListeners("SIGINT");
}

export async function createFile(path: string) {
  await (await fs.promises.open(path, "w")).close();
}

const baseFolder = () => `tests/testFolder${process.env.JEST_WORKER_ID}/${TEST_USER}`;

export function actualPath(filename: string) {
  return path.resolve(baseFolder(), filename);
}

// returns base folder
export async function createTestItems(): Promise<string> {
  const base = baseFolder();

  await fs.promises.mkdir(path.join(base, "dir1"), { recursive: true });

  await createFile(path.join(base, "test1"));

  return base;
}

export async function removeTestItems(): Promise<void> {
  const base = baseFolder();

  await fs.promises.rm(path.dirname(base), { recursive: true });
}


export function mockFileForm(size: number, filename: string) {
  const formData = new FormData();

  formData.append("file", Buffer.alloc(size, 1), {
    filename,
    contentType: "application/pdf",
    knownLength: size,
  });
  return formData;
}

