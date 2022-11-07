import { Static, TSchema } from "@sinclair/typebox";
import fs from "fs";
import { load } from "js-yaml";
import { basename, extname, join } from "path";

import { validateObject } from "./validation";

const parsers = {
  "yml": load,
  "yaml": load,
  "json": JSON.parse,
};

const candidates = Object.entries(parsers);

/**
 * 从文件中读取配置。
 * 读取优先级：yml -> yaml -> json
 *
 * @param schema JSON Schema对象
 * @param filename 文件名，不要带扩展名
 * @param basePath 配置文件路径。当NODE_ENV === production时，默认为/etc/scow, 否则为$PWD/config
 * @returns 配置对象
 * @throws 如果配置文件不存在，抛出异常
 */
export function getConfigFromFile<T extends TSchema>(
  schema: T, filename: string, basePath: string,
) {

  for (const [ext, loader] of candidates) {
    const path = join(basePath, filename + "." + ext);
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      return validateObject(schema, loader(content));
    }
  }

  throw new Error(`config ${filename} doesn't exist in ${basePath}`);
}

export function getDirConfig<T extends TSchema>(
  schema: T, dir: string, basePath: string,
): Record<string, Static<T>> {
  const configDir = join(basePath, dir);

  if (!fs.existsSync(configDir)) {
    return {};
  }

  const files = fs.readdirSync(configDir);

  return files.reduce((m, filename) => {

    const ext = extname(filename).substring(1);

    if (!(ext in parsers)) { return m; }

    const content = fs.readFileSync(join(configDir, filename), { encoding: "utf8" });

    const config = validateObject(schema, parsers[ext](content));

    if (config) {
      m[basename(filename, "." + ext)] = config;
    }

    return m;
  }, {});
}

export type GetConfigFn<T> = (baseConfigPath?: string) => T;

