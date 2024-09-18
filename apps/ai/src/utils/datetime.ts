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

import { parseTime } from "@scow/lib-web/build/utils/datetime";
import { TimeRangePickerProps } from "antd";
import dayjs from "dayjs";

export function formatDateTime(str: string): string {
  return dayjs(str)
    .format("YYYY-MM-DD HH:mm:ss");
}

export const defaultPresets: TimeRangePickerProps["presets"] = (() => {
  const now = dayjs();
  const end = now.endOf("day");

  return [
    { label: "今天", value: [now.startOf("day"), end]},
    { label: "本周", value: [now.startOf("week"), end]},
    { label: "本月", value: [now.startOf("month"), end]},
    { label: "今年", value: [now.startOf("year"), end]},
    { label: "3个月", value: [now.subtract(3, "month").startOf("day"), end]},
    { label: "6个月", value: [now.subtract(6, "month").startOf("day"), end]},
    { label: "一年", value: [now.subtract(1, "year").startOf("day"), end]},
  ];
})();

export function compareDateTime(a: string, b: string): number {
  const aMoment = dayjs(a);
  const bMoment = dayjs(b);

  if (aMoment.isSame(bMoment)) { return 0; }
  if (aMoment.isBefore(bMoment)) { return -1; }
  return 1;

}

export function getYesterdayTimestamp(): string {
  return dayjs().subtract(1, "day").toISOString();
}


function pad(num: number) {
  return num >= 10 ? num : "0" + num;
}

// calculate number of milliseconds to format [{days}-][{Hours}:]{MM}:{SS}
export function formatTime(milliseconds: number) {
  const seconds = milliseconds / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;

  let text = "";
  text += days >= 1 ? Math.floor(days) + "-" : "";
  const hoursModulo = Math.floor(hours % 24);
  text += hours >= 1 ? pad(hoursModulo) + ":" : "";
  const minModulo = Math.floor(minutes % 60);
  text += pad(minModulo);
  text += ":";
  const secModulo = Math.floor(seconds % 60);
  text += pad(secModulo);

  return text;
}

export function calculateAppRemainingTime(runningTime: string, timeLimit: string) {
  if (runningTime.split(/[:-]/).length < 2 || timeLimit.split(/[:-]/).length < 2) {
    // if timeLimit or runningTime is INVALID or UNLIMITED, return timeLimit
    return timeLimit;
  }
  const diffMs = parseTime(timeLimit) - parseTime(runningTime);
  return diffMs < 0 ? "00:00" : formatTime(diffMs);
}
