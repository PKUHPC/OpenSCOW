/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Type } from "@sinclair/typebox";
import { validateObject } from "src/validation";

const Schema = Type.Object({
  propertyA: Type.Number(),
});

it.each([
  [{ propertyA: 1 }, true],
  [{ propertyA: 1, propertyB: 2 }, true],
  [{ propertyA: "1" }, false],
  [{ propertyB: 2 }, false],

])("returns correct validation result", (data, expected) => {

  const result = validateObject(Schema, data);

  if (expected) {
    expect(result).toEqual(data);
  } else {
    expect(result).toBeInstanceOf(Error);
  }
});

