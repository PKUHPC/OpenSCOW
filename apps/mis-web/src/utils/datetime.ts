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
