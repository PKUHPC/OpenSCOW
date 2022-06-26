import type { RangePickerProps } from "antd/lib/date-picker";
import moment from "moment";

export function formatDateTime(str: string): string {
  return moment(str)
    .format("YYYY-MM-DD HH:mm:ss");
}

export function defaultRanges(): RangePickerProps["ranges"] {
  const now = moment();
  const end = now.clone().endOf("day");

  return {
    "今天": [now.clone().startOf("day"), end],
    "本月": [now.clone().startOf("month"), end],
    "今年": [now.clone().startOf("year"), end],
    "3个月": [now.clone().subtract(3, "month").startOf("day"), end],
    "6个月": [now.clone().subtract(6, "month").startOf("day"), end],
    "一年": [now.clone().subtract(1, "year").startOf("day"), end],
  };
}

export function compareDateTime(a: string, b: string): number {
  const aMoment = moment(a);
  const bMoment = moment(b);

  if (aMoment.isSame(bMoment)) { return 0; }
  if (aMoment.isBefore(bMoment)) { return -1; }
  return 1;

}
