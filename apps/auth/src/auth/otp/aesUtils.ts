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


const separator = "#";
export const REDIS_KEY = "auth:otp:ivkey";

function decodeIvKeyFromBase64(data: string) {
  const encryIv = data.split(separator)[0];
  const encryKey = data.split(separator)[1];
  const iv = Buffer.from(encryIv, "base64");
  const key = Buffer.from(encryKey, "base64");
  return {
    iv,
    key,
  };
}

export async function generateIvAndKey(f: FastifyInstance) {
  const iv = crypto.randomBytes(16);
  const key = crypto.randomBytes(32);
  const encryStr = iv.toString("base64") + separator + key.toString("base64");
  await f.redis.set(REDIS_KEY, encryStr);
  return {
    iv,
    key,
  };
}

export async function aesEncryptData(f: FastifyInstance, text: string) {
  let ivAndKey: {iv: Buffer, key: Buffer};
  const result = await f.redis.get(REDIS_KEY);
  if (!result) {
    ivAndKey = await generateIvAndKey(f);
  } else {
    ivAndKey = decodeIvKeyFromBase64(result);
  }
  const cipher = crypto.createCipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

// 解密时，如果redis服务器重启, 返回undefined,通知上层函数
export async function aesDecryptData(f: FastifyInstance, text: string) {
  let ivAndKey: {iv: Buffer, key: Buffer};
  const result = await f.redis.get(REDIS_KEY);
  if (!result) {
    return;
  } else {
    ivAndKey = decodeIvKeyFromBase64(result);
  }
  const encryptedTexyt = Buffer.from(text, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let decrypted = decipher.update(encryptedTexyt);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}
