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

import { useCallback, useState } from "react";
import { destroyUserInfoCookie } from "src/auth/cookie";

export interface User {
  identityId: string;
  name?: string;
  token: string;
}

export function UserStore(initialUser: User | undefined = undefined) {
  const [user, setUser] = useState<User | undefined>(initialUser);

  const loggedIn = !!user;

  const logout = useCallback(() => {
    // api.logout({}).catch((e) => { console.log("Error when logout", e); });
    setUser(undefined);
    destroyUserInfoCookie(null);
  }, []);

  return { loggedIn, user, logout };
}

// import { useCallback, useState } from "react";
// import { StoreInit } from "simstate";
// import { destroyUserInfoCookie } from "src/auth/cookie";

// export interface User {
//   identityId: string;
//   name?: string;
//   token: string;
// }

// // 定义表示 UserStore 状态的接口
// export interface UserStoreState {
//   loggedIn: boolean;
//   user: User | undefined;
//   logout: () => void;
// }

// // 使用空数组作为第二个类型参数，表示没有接受参数
// export const UserStore: StoreInit<UserStoreState, []> = (initialUser?: User) => {
//   const [user, setUser] = useState<User | undefined>(initialUser);

//   const loggedIn = !!user;

//   const logout = useCallback(() => {
//     setUser(undefined);
//     destroyUserInfoCookie(null);
//   }, []);

//   return { loggedIn, user, logout };
// };

