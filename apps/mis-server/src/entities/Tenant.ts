import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Decimal } from "@scow/lib-decimal";
import { DECIMAL_DEFAULT_RAW,DecimalType } from "src/utils/decimal";

@Entity()
export class Tenant {

  @PrimaryKey()
    id!: number;

  @Property({ unique: true })
    name: string;

  @Property({ type: DecimalType, defaultRaw: DECIMAL_DEFAULT_RAW })
    balance: Decimal = new Decimal(0);

  constructor(init: {
    name: string,
  }) {
    this.name = init.name;
  }

}
