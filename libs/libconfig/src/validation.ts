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
import Ajv from "ajv/dist/2019";
import addFormats from "ajv-formats";

export const createAjv = () => addFormats(new Ajv({
  useDefaults: true,
}), [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex",
]).addKeyword("kind")
  .addKeyword("modifier");

export function validateObject<TObj extends TSchema>(
  schema: TObj, object: any,
): Static<TObj> | Error {

  const ajv = createAjv();
  const ok = ajv.validate(schema, object);

  if (!ok) {
    return new Error(ajv.errorsText());
  }

  return object;
}
