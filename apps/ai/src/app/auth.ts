/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

// import { deleteUserToken } from "src/server/auth/cookie";
import { trpc } from "src/utils/trpc";


export const useUserQuery = () => {

  return trpc.auth.getUserInfo.useQuery(undefined, {
    // user info is never refreshed in the client
    staleTime: Infinity,
  });
};

export const useLogoutMutation = () => {
  return trpc.auth.logout.useMutation();
};

export const useOptionalUser = () => {
  const context = useUserQuery().data?.user;
  return context;
};

export const useUser = () => {

  const user = useOptionalUser();
  if (!user) { throw new Error("not logged in"); }
  return user;
};
