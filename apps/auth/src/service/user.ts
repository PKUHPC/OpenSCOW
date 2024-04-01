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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
<<<<<<< HEAD
import { CheckUnicomUserExistResponse, UserServiceClient } from "@scow/protos/build/server/user";
import { getClient } from "src/utils/getClient";

export async function checkUnicomUserExisted(unicomUserId: string): Promise<CheckUnicomUserExistResponse> {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "checkUnicomUserExist", { unicomUserId });

}

export async function createUser(userId: string, userInfo) {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "createUser", {
    name:userInfo.account,
    tenantName:"default",
    email:userInfo.email ?? "",
    identityId: userId,
    password:`unicom_${userInfo.phone}`,
    unicomId:userInfo.id,
  });

=======
import { PlatformUserInfo, UserServiceClient } from "@scow/protos/build/server/user";
import { getClient } from "src/utils/getClient";

export async function getUserById(id: string): Promise<PlatformUserInfo | undefined> {

  const client = getClient(UserServiceClient);

  const users = await asyncClientCall(client, "getAllUsers", {
    idOrName:id,
    page:1,
  });

  if (!users.platformUsers.length) {
    return undefined;
  }

  const user = users.platformUsers.find((i) => i.userId === id);

  return user;
>>>>>>> 9701eaf1bd (feat:unicom三方登录)
}


