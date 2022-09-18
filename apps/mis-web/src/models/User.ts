import { Static, Type } from "@sinclair/typebox";

// Redefine to avoid importing non client packages
export enum TenantRole {
  TENANT_ADMIN = 0,
  TENANT_FINANCE = 1,
}

export enum PlatformRole {
  PLATFORM_ADMIN = 0,
  PLATFORM_FINANCE = 1,
}

export const PlatformRoleTexts = {
  [PlatformRole.PLATFORM_FINANCE]: "财务人员",
  [PlatformRole.PLATFORM_ADMIN]: "平台管理员",
};

export const TenantRoleTexts = {
  [TenantRole.TENANT_FINANCE]: "财务人员",
  [TenantRole.TENANT_ADMIN]: "租户管理员",
};

export enum UserRole {
  USER = 0,
  ADMIN = 1,
  OWNER = 2,
}

export const UserRoleTexts = {
  [UserRole.USER]: "用户",
  [UserRole.OWNER]: "拥有者",
  [UserRole.ADMIN]: "管理员",
};

export enum UserStatus {
  UNBLOCKED = 0,
  BLOCKED = 1,
}

export const AccountAffiliationSchema = Type.Object({
  accountName: Type.String(),
  role: Type.Enum(UserRole),
});


export type AccountAffiliation = Static<typeof AccountAffiliationSchema>;

export const UserInfoSchema = Type.Object({
  tenant: Type.String(),
  name: Type.String(),
  identityId: Type.String(),
  accountAffiliations: Type.Array(AccountAffiliationSchema),
  tenantRoles: Type.Array(Type.Enum(TenantRole)),
  platformRoles: Type.Array(Type.Enum(PlatformRole)),
});

export type UserInfo = Static<typeof UserInfoSchema>;

export interface FullUserInfo {
  id: string;
  name: string;
  email: string;
  createTime: string;
  accountAffiliations: { accountName: string; role: UserRole }[];
  platformRoles: PlatformRole[];
}

