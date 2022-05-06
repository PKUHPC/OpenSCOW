import { Decimal, decimalToMoney, moneyToNumber, numberToMoney } from "../src";

interface Money {
  positive: boolean;
  yuan: number;
  mills: number;
}

it("performs correct converions", async () => {
  expect(numberToMoney(20.4)).toMatchObject({ positive: true, mills: 400, yuan: 20 } as Money);
  expect(moneyToNumber({ mills: 201, yuan: 100, positive: true })).toBe(100.201);
  expect(moneyToNumber({ mills: 30, yuan: 100, positive: false })).toBe(-100.03);
  expect(decimalToMoney(new Decimal(-200.317))).toMatchObject({ yuan:200, mills: 317, positive: false });
});

