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

import { getCurrentLangLibWebText } from "./libWebI18nTexts";



export function formatDateTime(str: string): string {
  return dayjs(str)
    .format("YYYY-MM-DD HH:mm:ss");
}

export const getDefaultPresets = (languageId: string): TimeRangePickerProps["presets"] => {
  const now = dayjs();
  const end = now.endOf("day");

  const today = getCurrentLangLibWebText(languageId, "utils.dateTime.today");
  const tWeek = getCurrentLangLibWebText(languageId, "utils.dateTime.tWeek");
  const tMonth = getCurrentLangLibWebText(languageId, "utils.dateTime.tMonth");
  const tYear = getCurrentLangLibWebText(languageId, "utils.dateTime.tYear");
  const threeMonths = getCurrentLangLibWebText(languageId, "utils.dateTime.threeMonths");
  const sixMonths = getCurrentLangLibWebText(languageId, "utils.dateTime.sixMonths");
  const oneYear = getCurrentLangLibWebText(languageId, "utils.dateTime.oneYear");


  return [
    { label: today, value: [now.startOf("day"), end]},
    { label: tWeek, value: [now.startOf("week"), end]},
    { label: tMonth, value: [now.startOf("month"), end]},
    { label: tYear, value: [now.startOf("year"), end]},
    { label: threeMonths, value: [now.subtract(3, "month").startOf("day"), end]},
    { label: sixMonths, value: [now.subtract(6, "month").startOf("day"), end]},
    { label: oneYear, value: [now.subtract(1, "year").startOf("day"), end]},
  ];
};

export function compareDateTime(a: string, b: string): number {
  const aMoment = dayjs(a);
  const bMoment = dayjs(b);

  if (aMoment.isSame(bMoment)) { return 0; }
  if (aMoment.isBefore(bMoment)) { return -1; }
  return 1;

}

// Parse the given string in [{days}-][{Hours}:]{MM}:{SS} format and return number of milliseconds
export function parseTime(time: string) {
  const list = time.split(/[:-]/).map((x) => +x);

  const seconds = list.at(-1);
  const minutes = list.at(-2);
  const hours = list.at(-3) ?? 0;
  const days = list.at(-4) ?? 0;

  return seconds! * 1000 + minutes! * 60000 + (hours * 3600000) + days * 86400000;

}
