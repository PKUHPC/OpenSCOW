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

import * as crypto from "crypto";
import { FastifyInstance } from "fastify";

let iv: Buffer = Buffer.alloc(16);
let key: Buffer = Buffer.alloc(32);
const separator = "#";
export const REDIS_KEY = "ccd9a558-3404-4c65-8b39-27181861ecf8";

function deBase64(data: string) {
  const encryIv = data.split(separator)[0];
  const encryKey = data.split(separator)[1];
  iv = Buffer.from(encryIv, "base64");
  key = Buffer.from(encryKey, "base64");
}

export async function generateIvAndKey(f: FastifyInstance) {

  const result = await f.redis.get(REDIS_KEY);
  if (!result) {
    iv = crypto.randomBytes(16);
    key = crypto.randomBytes(32);
    const encryStr = iv.toString("base64") + separator + key.toString("base64");
    await f.redis.set(REDIS_KEY, encryStr);
  } else {
    deBase64(result);
  }
}
export function getIvAndKey() {
  return {
    iv,
    key,
  };
}
export async function aesEncryptData(f: FastifyInstance, text: string) {
  let ivAndKey = getIvAndKey();
  if (!ivAndKey) {
    await generateIvAndKey(f);
    ivAndKey = getIvAndKey();
  }
  const cipher = crypto.createCipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

export async function aesDecryptData(f: FastifyInstance, text: string) {
  let ivAndKey = getIvAndKey();
  if (!ivAndKey) {
    const result = await f.redis.get(REDIS_KEY);
    if (!result) {
      return;
    } else {
      deBase64(result);
      ivAndKey = getIvAndKey();
    }
  }
  const encryptedTexyt = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let decrypted = decipher.update(encryptedTexyt);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
