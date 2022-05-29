import { ArrayType, Collection, Entity, IdentifiedReference,
  ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { StorageQuota } from "src/entities/StorageQuota";
import { Tenant } from "src/entities/Tenant";
import { UserAccount } from "src/entities/UserAccount";
import { DATETIME_TYPE, EntityOrRef, toRef } from "src/utils/orm";

export enum PlatformRole {
  PLATFORM_FINANCE = "PLATFORM_FINANCE",
  PLATFORM_ADMIN = "PLATFORM_ADMIN",
}

export enum TenantRole {
  TENANT_FINANCE = "TENANT_FINANCE",
  TENANT_ADMIN = "TENANT_ADMIN",
}

@Entity()
export class User {
  @PrimaryKey()
    id!: number;

  @ManyToOne(() => Tenant, { wrappedReference: true })
    tenant: IdentifiedReference<Tenant>;

  @Property({ unique: true })
    userId: string;

  @OneToMany(() => StorageQuota, (u) => u.user)
    storageQuotas = new Collection<StorageQuota>(this);

  @Property()
    name: string;

  @Property()
    email: string;

  @Property({ columnType: DATETIME_TYPE, defaultRaw: "CURRENT_TIMESTAMP(6)" })
    createTime: Date;

  @OneToMany(() => UserAccount, (u) => u.user)
    accounts = new Collection<UserAccount>(this);

  @Property({ type: ArrayType, comment: Object.values(TenantRole).join(", ") })
    tenantRoles: TenantRole[];

  @Property({ type: ArrayType, comment: Object.values(PlatformRole).join(", ") })
    platformRoles: PlatformRole[];

  constructor(init: {
    userId: string;
    tenant: EntityOrRef<Tenant>;
    name: string;
    email: string;
    createTime?: Date;
    tenantRoles?: TenantRole[];
    platformRoles?: PlatformRole[];
  }) {
    this.userId = init.userId;
    this.tenant = toRef(init.tenant);
    this.name = init.name;
    this.email = init.email;
    this.createTime = init.createTime ?? new Date();
    this.tenantRoles = init.tenantRoles ?? [];
    this.platformRoles = init.platformRoles ?? [];
  }

}
