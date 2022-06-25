import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class SystemState {
  @PrimaryKey()
    key: string;

  @Property()
    value: string;

  public static KEYS = {
    INITIALIZATION_TIME: "INITIALIZATION_TIME",
  } as const;

  constructor(key: keyof typeof SystemState.KEYS, value: string) {
    this.key = key;
    this.value = value;
  }

}
