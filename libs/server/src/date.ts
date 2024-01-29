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

