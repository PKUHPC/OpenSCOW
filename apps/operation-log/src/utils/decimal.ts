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

import { Type } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";

/**
 * This type saves datetime value in mysql with ms precision
 * aligning the value in DB with the value in JS.
 */

const dbPrecision = 4;
const DECIMAL_COLUMN_TYPE = `DECIMAL(19,${dbPrecision})`;
export const DECIMAL_DEFAULT_RAW = `0.${"0".repeat(dbPrecision)}`;

export class DecimalType extends Type<Decimal | undefined, string | undefined> {
  convertToDatabaseValue(value: Decimal | string | undefined): string | undefined {
    if (!value) { return value; }
    return value.toString();
  }

  convertToJSValue(value: string | undefined): Decimal | undefined {
    if (!value) { return undefined; }
    return new Decimal(value);
  }

  getColumnType(): string {
    return DECIMAL_COLUMN_TYPE;
  }

  compareAsType(): string {
    return "number";
  }

}
