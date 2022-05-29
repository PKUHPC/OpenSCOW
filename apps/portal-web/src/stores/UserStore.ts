import { useCallback, useState } from "react";
import { api } from "src/apis";
import { destroyUserInfoCookie } from "src/auth/cookie";

export interface User {
  identityId: string;
  token: string;
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
