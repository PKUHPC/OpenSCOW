import { AccountAffiliation, PlatformRole, TenantRole, UserInfo } from "src/models/user";

export interface User {
  tenant: string;
  identityId: string;
  name?: string;
  token: string;
  tenantRoles: TenantRole[];
  platformRoles: PlatformRole[];
  accountAffiliations: AccountAffiliation[];
  email?: string;
  createTime?: string
}


type UserType = {
  loggedIn: boolean;
  user: User | undefined;
  logout: () => void;
} | undefined;

export interface RequireAuthProps {
  userStore: UserType & { user: User },
}

export type Check = (info: UserInfo) => boolean;
