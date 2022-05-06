import { moneyToNumber } from "@scow/lib-decimal";
import type { Money } from "src/generated/common/money";

export function moneyToString(money: Money) {
  return moneyToNumber(money).toFixed(3);
}

export function nullableMoneyToString(money: Money | undefined) {
  return money ? moneyToString(money) : Number.prototype.toFixed.call(0, 3);
}
