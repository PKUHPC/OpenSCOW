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

import { Logger } from "@ddadaal/tsgrpc-server";
import { DateMessage } from "@scow/protos/build/google/type/date";
import { convertToDateMessage } from "src/date";

const mockLogger = {
  error: jest.fn(),
};

it("returns a DateMessage for valid date string", () => {
  const dateStr = "2021-12-31";
  const result = convertToDateMessage(dateStr, mockLogger as unknown as Logger);
  expect(result).toEqual(DateMessage.create({ year: 2021, month: 12, day: 31 }));
});

it("returns undefined for invalid date format", () => {
  const dateStr = "2021-12-31-01";
  const result = convertToDateMessage(dateStr, mockLogger as unknown as Logger);
  expect(result).toBeUndefined();
  expect(mockLogger.error).toHaveBeenCalledWith(`Invalid date format: ${dateStr}`);
});

it("returns undefined for invalid date", () => {
  const dateStr = "2021-02-30";
  const result = convertToDateMessage(dateStr, mockLogger as unknown as Logger);
  expect(result).toBeUndefined();
  expect(mockLogger.error).toHaveBeenCalledWith(`Invalid date in: ${dateStr}`);
});
