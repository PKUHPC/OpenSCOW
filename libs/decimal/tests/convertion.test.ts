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

import { Decimal, decimalToMoney, moneyToNumber, numberToMoney } from "../src";


interface Money {
  positive: boolean;
  yuan: number;
  decimalPlace: number;
}

it("performs correct converions", async () => {
  expect(numberToMoney(20.4)).toMatchObject({ positive: true, decimalPlace: 4000, yuan: 20 } as Money);
  expect(moneyToNumber({ decimalPlace: 2010, yuan: 100, positive: true })).toBe(100.201);
  expect(moneyToNumber({ decimalPlace: 30, yuan: 100, positive: false })).toBe(-100.003);
  expect(decimalToMoney(new Decimal(-200.3173)))
    .toMatchObject({ yuan: 200, decimalPlace: 3173, positive: false } as Money);
});

