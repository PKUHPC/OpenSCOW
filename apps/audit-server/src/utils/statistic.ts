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

type DateRange = {
  startDate: string;
  endDate: string;
};

export function generateDateRangeArray(startTime: string, endTime: string): DateRange[] {
  const startDateTime = new Date(startTime);
  const endDateTime = new Date(endTime);
  const days: DateRange[] = [];

  const totalDays = Math.ceil((endDateTime.getTime() - startDateTime.getTime()) / (24 * 60 * 60 * 1000));

  for (let i = 0; i < totalDays; i++) {
    const startDate = new Date(startDateTime);
    const endDate = new Date(startDateTime);

    startDate.setHours(startDateTime.getHours() + i * 24);
    endDate.setHours(endDate.getHours() + (i + 1) * 24 - 1, 59, 59, 999);

    days.push({
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    });
  }

  return days;

}
