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

import React from "react";
import { useStore } from "simstate";
import { ForbiddenPage } from "src/components/errorPages/ForbiddenPage";
import { NotAuthorizedPage } from "src/components/errorPages/NotAuthorizedPage";
import type { UserInfo } from "src/models/User";
import { User, UserStore } from "src/stores/UserStore";

type UserStoreType = ReturnType<typeof UserStore>;

export interface RequireAuthProps {
  userStore: UserStoreType & { user: User },
}

export type Check = (info: UserInfo) => boolean;

export const requireAuth = (
  check: Check,
  extraCheck?: (user: User) => JSX.Element | undefined,
) =>
  <CP extends {}>(
    Component: React.ComponentType<RequireAuthProps & CP>,
  ) => (cp) => {
    const userStore = useStore(UserStore);

    if (!userStore.user) {
      return <NotAuthorizedPage />;
    }

    if (!check(userStore.user)) {
      return <ForbiddenPage />;
    }

    if (extraCheck) {
      const node = extraCheck(userStore.user!);
      if (node) {
        return node;
      }
    }

    return <Component userStore={userStore} {...cp} />;
  };
