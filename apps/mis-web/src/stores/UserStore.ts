import { useCallback, useState } from "react";
import { api } from "src/apis";
import { destroyUserInfoCookie } from "src/auth/cookie";
import { AccountAffiliation, PlatformRole, TenantRole } from "src/models/User";

export interface User {
  tenant: string;
  identityId: string;
  name: string;
  token: string;
  tenantRoles: TenantRole[];
  platformRoles: PlatformRole[];
  accountAffiliations: AccountAffiliation[];
}

export function UserStore(initialUser: User | undefined = undefined) {
  const [user, setUser] = useState<User | undefined>(initialUser);

  const loggedIn = !!user;

  const logout = useCallback(() => {
    destroyUserInfoCookie(null);
    setUser(undefined);
    api.logout({}).catch((e) => { console.log("Error when logout", e);});
  }, []);

  return { loggedIn, user, logout };
}
