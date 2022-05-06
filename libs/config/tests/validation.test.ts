import { Type } from "@sinclair/typebox";
import { validateObject } from "src/validation";

const Schema = Type.Object({
  propertyA: Type.Number(),
});

it("passes valiation", async () => {

  validateObject(Schema, { propertyA: 1 });
  validateObject(Schema, { propertyA: 1, propertyB: 2 });
});

it("fails valiation", async () => {

  expect(() => validateObject(Schema, { propertyA: "number" })).toThrow();
  expect(() => validateObject(Schema, { propertyB: 2 })).toThrow();
});

