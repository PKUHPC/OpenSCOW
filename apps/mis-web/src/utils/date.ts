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

import dayjs, { Dayjs } from "dayjs";

interface DateMessage {
  year: number;
  month: number;
  day: number;
}

export function dateMessageToDayjs(dateMessage: DateMessage): Dayjs {
  const { year, month, day } = dateMessage;

  let date: Dayjs;
  if (year === 0) {
    // 没有年份信息，返回当前日期
    date = dayjs();
  } else if (month === 0) {
    // 只有年份信息，返回该年的1月1日
    date = dayjs(`${year}`);
  } else if (day === 0) {
    // 有年份和月份，但没有日信息，返回该月的第一天
    date = dayjs(`${year}-${month}`);
  } else {
    // 有年、月、日信息
    date = dayjs(`${year}-${month}-${day}`);
  }

  return date;
}

