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

import { Decimal } from "../src";

it("performs correct values", async () => {
  const expectEqual = (actual: Decimal, expected: Decimal) => {
    expect(actual.toNumber()).toBe(expected.toNumber());
  };

  const v = (v) => new Decimal(v);

  expectEqual(v(0.1).plus(v(0.2)), v(0.3));
  expectEqual(v(100000).minus(v(0.01)), v(99999.99));
  expectEqual(v(0.03).multipliedBy(0.14), v(0.0042));

});
