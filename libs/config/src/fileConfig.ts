import { Static, TSchema } from "@sinclair/typebox";
import fs from "fs";
import { load } from "js-yaml";
import { join } from "path";

import { CONFIG_BASE_PATH } from "./constants";
import { validateObject } from "./validation";

const candidates = [
  ["yml", load],
  ["yaml", load],
  ["json", JSON.parse],
] as const;

function tryResolveConfig<T extends TSchema>(schema: T, basePath: string, filename: string): Static<T> | undefined {
  for (const [ext, loader] of candidates) {
    const path  = join(basePath, filename + "." + ext);
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      return validateObject(schema, loader(content));
    }
  }

  return undefined;
}

/**
 * 从文件中读取配置。
 * 读取优先级：yml -> yaml -> json
 *
 * @param schema JSON Schema对象
 * @param filename 文件名，不要带扩展名
 * @param allowNotExistent 是否允许配置文件不存在
 * @param basePath 配置文件路径。当NODE_ENV === production时，默认为/etc/scow, 否则为$PWD/config
 * @returns 配置对象
 */
export function getConfigFromFile<T extends TSchema>(
  schema: T, filename: string, allowNotExistent: true, basePath?: string): Static<T> | undefined
export function getConfigFromFile<T extends TSchema>(
  schema: T, filename: string, allowNotExistent?: false, basePath?: string): Static<T>
export function getConfigFromFile<T extends TSchema>(
  schema: T, filename: string, allowNotExistent = false,
  basePath = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config") {

  const config = tryResolveConfig(schema, basePath, filename);

  if (config) { return config; }

  if (!allowNotExistent) {
    throw new Error(`No config named ${filename} exists.`);
  } else {
    return undefined;
  }
}

export function getDirConfig<T extends TSchema>(
  schema: T,
  dir: string,
  basePath = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config",
): Record<string, Static<T>> {
  const configDir = join(basePath, dir);

  if (!fs.existsSync(configDir)) {
    return {};
  }

  const files = fs.readdirSync(configDir);

  return files.reduce((m, filename) => {
    const config = tryResolveConfig(schema, configDir, filename);

    if (config) {
      m[filename] = config;
    }

    return m;
  }, {});
}
