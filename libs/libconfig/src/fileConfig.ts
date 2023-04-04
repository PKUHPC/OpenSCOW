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
 * 从具体的文件中读取配置
 * @param schema JSON Schema对象
 * @param filePath 文件路径
 * @returns 配置对象
 * @throws 如果配置文件不存在，或者不匹配格式，抛出异常
 */
export function getConfig<T extends TSchema>(
  schema: T, filePath: string,
): Static<T> {
  // extname returns .yml
  const ext = extname(filePath).substring(1);

  if (!(ext in parsers)) {
    throw new Error(`Unsupported config file extension ${ext}`);
  }

  const content = fs.readFileSync(filePath, { encoding: "utf8" });

  const result = validateObject(schema, parsers[ext](content));
  if (result instanceof Error) {
    throw new Error("Error reading config file " + filePath + ": " + result.message);
  }
  return result;
}

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
): Static<T> {

  for (const [ext, loader] of candidates) {
    const path = join(basePath, filename + "." + ext);
    if (fs.existsSync(path)) {
      const content = fs.readFileSync(path, { encoding: "utf8" });
      const obj = validateObject(schema, loader(content));
      if (obj instanceof Error) {
        throw new Error(`Error reading config file ${path}: ${obj.message}`);
      }
      return obj;
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

    const configFilePath = join(configDir, filename);

    const content = fs.readFileSync(configFilePath, { encoding: "utf8" });

    const config = validateObject(schema, parsers[ext](content));

    if (config instanceof Error) {
      throw new Error(`Error reading config file ${configFilePath}: ${config.message}`);
    }

    if (config) {
      m[basename(filename, "." + ext)] = config;
    }

    return m;
  }, {});
}

export type GetConfigFn<T> = (baseConfigPath?: string) => T;

