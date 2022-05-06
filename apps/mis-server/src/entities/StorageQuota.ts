import { Entity, IdentifiedReference, ManyToOne, PrimaryKey, Property } from
  "@mikro-orm/core";
import { User } from "src/entities/User";
import { EntityOrRef, toRef } from "src/utils/orm";

@Entity()
export class StorageQuota {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => User, { onDelete: "CASCADE", wrappedReference: true })
    user: IdentifiedReference<User>;

  @Property()
    cluster: string;

  // 和后台统一，为B。1PB=10^15B，应该一个int就够用了
  @Property({ columnType: "int" })
    storageQuota: number;

  constructor(init: {
    user: EntityOrRef<User>,
    cluster: string,
    storageQuota: number,
  }) {
    this.user = toRef(init.user);
    this.cluster = init.cluster;
    this.storageQuota = init.storageQuota;
  }

}
