/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";

// Redefine to avoid importing non client packages
export const TenantRole = {
  TENANT_ADMIN: 0,
  TENANT_FINANCE: 1,
} as const;

export type TenantRole = ValueOf<typeof TenantRole>;

export const PlatformRole = {
  PLATFORM_ADMIN: 0,
  PLATFORM_FINANCE: 1,
} as const;

export type PlatformRole = ValueOf<typeof PlatformRole>;

export const PlatformRoleTexts = {
  [PlatformRole.PLATFORM_FINANCE]: "平台财务人员",
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

export enum ClusterAccountInfo_ImportStatus {
  EXISTING = 0,
  NOT_EXISTING = 1,
  HAS_NEW_USERS = 2,
}

export const AccountAffiliationSchema = Type.Object({
  accountName: Type.String(),
  role: Type.Enum(UserRole),
});


export type AccountAffiliation = Static<typeof AccountAffiliationSchema>;

export const UserInfoSchema = Type.Object({
  tenant: Type.String(),
  name: Type.Optional(Type.String()),
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
  tenantRoles: TenantRole[];
}

