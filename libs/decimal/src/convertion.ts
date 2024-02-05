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

import { Decimal } from "./index";

interface Money {
  positive: boolean;
  yuan: number;
  decimalPlace: number;
}

const DECIMAL_PLACE = 10000;

export const moneyToNumber = (money: Money) => {
  const num = money.yuan + money.decimalPlace / DECIMAL_PLACE;
  return money.positive ? num : -num;
};

export const numberToMoney = (num: number): Money =>
  decimalToMoney(new Decimal(num));

export const decimalToMoney = (dec: Decimal): Money => {

  const abs = dec.abs();

  return {
    positive: dec.gte(0),
    yuan: abs.integerValue(Decimal.ROUND_FLOOR).toNumber(),
    decimalPlace: abs.multipliedBy(DECIMAL_PLACE).mod(DECIMAL_PLACE).integerValue(Decimal.ROUND_FLOOR).toNumber(),
  };
};
