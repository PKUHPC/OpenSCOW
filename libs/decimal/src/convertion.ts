import { Decimal } from "./index";

interface Money {
  positive: boolean;
  yuan: number;
  mills: number;
}

export const moneyToNumber = (money: Money) => {
  const num = money.yuan + money.mills / 1000;
  return money.positive ? num : -num;
};

export const numberToMoney = (num: number): Money =>
  decimalToMoney(new Decimal(num));

export const decimalToMoney = (dec: Decimal): Money => {

  const abs = dec.abs();

  return {
    positive: dec.gte(0),
    yuan: abs.integerValue(Decimal.ROUND_FLOOR).toNumber(),
    mills: abs.multipliedBy(1000).mod(1000).integerValue(Decimal.ROUND_FLOOR).toNumber(),
  };
};
