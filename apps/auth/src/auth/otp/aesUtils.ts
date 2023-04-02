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

let iv: Buffer = Buffer.alloc(16);
let key: Buffer = Buffer.alloc(32);

export function generateIvAndKey() {
  iv = crypto.randomBytes(16);
  key = crypto.randomBytes(32);
}
export function getIvAndKey() {
  return {
    iv,
    key,
  };
}
export function aesEncryptData(text: string) {
  const ivAndKey = getIvAndKey();
  const cipher = crypto.createCipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString("hex");
}

export function aesDecryptData(text: string) {
  const encryptedTexyt = Buffer.from(text, "hex");
  const ivAndKey = getIvAndKey();
  const decipher = crypto.createDecipheriv("aes-256-cbc", ivAndKey.key, ivAndKey.iv);
  let decrypted = decipher.update(encryptedTexyt);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}




