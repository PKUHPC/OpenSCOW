import fs from "fs";
import { join } from "path";
import { Command } from "src/plugins/worker";
import type { FileInfo } from "src/routes/list";

export const ALREADY_EXISTS = 2;
export const NOT_DIRECTORY = 3;

export function runWorker(restArgv: string[]): never {
  type Handler<T extends keyof Command> = (...args: Command[T]) => number | void;

  const handlers = new Map<keyof Command, Handler<any>>();

  function registerHandler<T extends keyof Command>(cmd: T, handler: Handler<T>) {
    handlers.set(cmd, handler);
  }

  registerHandler("readable", (path) => {
    fs.accessSync(path, fs.constants.R_OK);
  });

  registerHandler("delete", (path) => {
    fs.rmSync(path, { recursive: true });
  });

  registerHandler("move", (from, to) => {
    fs.renameSync(from, to);
  });

  registerHandler("copy", (from, to) => {
    fs.cpSync(from, to, { recursive: true });
  });

  registerHandler("mkdir", (path) => {
    if (fs.existsSync(path)) {
      return ALREADY_EXISTS;
    }
    fs.mkdirSync(path, { recursive: true });
  });

  registerHandler("createFile", (path) => {
    if (fs.existsSync(path)) {
      return ALREADY_EXISTS;
    }
    fs.closeSync(fs.openSync(path, "w"));
  });

  registerHandler("ls", (path) => {
    const stat = fs.statSync(path);

    if (!stat.isDirectory()) {
      return NOT_DIRECTORY;
    }

    const files = fs.readdirSync(path);

    const items = files.reduce((list, filename) => {
      const filePath = join(path, filename);
      try {
        const stat = fs.statSync(filePath);

        list.push({
          type: stat.isDirectory() ? "dir" : "file",
          name: filename,
          mtime: stat.mtime.toISOString(),
          size: stat.size,
          mode: stat.mode,
        });
      } catch (e) {
        if (filePath === "/snapshot") {
          // pkg packages binary has /snapshot in its fs
          // which doesn't exist in real fs
          // if stat /snapshot failed, it is the /snapshot
          // this error can be ignored
        } else {
          // stat some file fails. return a
          list.push({ type: "error", name: filename });
        }
      }
      return list;
    }, [] as FileInfo[]);

    process.stdout.write(JSON.stringify(items));
  });

  const [cmd, ...args] = restArgv as [keyof Command, Command[keyof Command]];

  const handler = handlers.get(cmd);

  if (!handler) {
    console.error("Unknown command", cmd, ...args);
    process.exit(1);
  }

  const returnCode = handler(...args);
  process.exit(returnCode ?? 0);
}

