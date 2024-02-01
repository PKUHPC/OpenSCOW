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

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { Logger } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { DateMessage } from "@scow/protos/build/google/type/date";
import dayjs, { Dayjs } from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// 使用插件
dayjs.extend(utc);
dayjs.extend(timezone);


function isValidDate(year: number, month: number, day: number): boolean {
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}


export function convertToDateMessage(dateStr: string, logger: Logger): DateMessage | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    logger.error(`Invalid date format: ${dateStr}`);
    return;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (!isValidDate(year, month, day)) {
    logger.error(`Invalid date in: ${dateStr}`);
    return;
  }

  return DateMessage.create({ year, month, day });
}


export function isValidTimezone(timezoneStr: string) {
  try {
    // 检查是否是有效的 UTC 偏移量格式
    const utcOffsetPattern = /^[+-](?:2[0-3]|[01][0-9]):[0-5][0-9]$/;
    if (utcOffsetPattern.test(timezoneStr)) {
      // 使用 dayjs 解析 UTC 偏移量
      const testDate = dayjs("2024-01-01").utcOffset(timezoneStr);
      return testDate.format("Z") === timezoneStr;
    } else {
      // 尝试使用 timezone 插件解析时区名称
      dayjs.tz("2024-01-01", timezoneStr);
      // 如果 dayjs 能够正确解析时区名称，函数将正常运行并返回 true
      return true;
    }
  } catch (e) {
    // 如果发生错误，说明时区字符串无效
    return false;
  }
}


// 将 Dayjs 对象转换为 DateMessage
export function dayjsToDateMessage(dayjsObj: Dayjs): DateMessage {
  return DateMessage.create({
    year: dayjsObj.year(),
    month: dayjsObj.month() + 1, // Dayjs 的月份是从 0 开始计数的
    day: dayjsObj.date(),
  });
}

export function checktTimeZone(timeZone: string) {
  if (!isValidTimezone(timeZone)) {
    throw <ServiceError>{
      code: status.INVALID_ARGUMENT,
      message: "Invalid timezone",
    };
  }
}
