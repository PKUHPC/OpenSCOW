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
import { CheckUnicomUserExistResponse, CheckUserExistResponse, UserServiceClient }
  from "@scow/protos/build/server/user";
import { getClient } from "src/utils/getClient";

export async function checkUnicomUserExisted(unicomUserId: string): Promise<CheckUnicomUserExistResponse> {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "checkUnicomUserExist", { unicomUserId });
}

export async function createUnicomUser(userId: string, userInfo) {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "createUser", {
    name:userInfo.account,
    tenantName:"default",
    email:userInfo.email ?? "",
    identityId: userId,
    password:`unicom_${userInfo.phone}`,
    unicomId:userInfo.id,
  });

}

export async function checkUserExisted(userId: string, phone: string, email: string):
Promise<CheckUserExistResponse> {

  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "checkUserExist", { userId, phone, email });
}

interface registerUserProps {
  userId: string,
  userName: string,
  email: string,
  password: string,
  country: string,
  phone: string,
}

export async function registerUser(userInfo: registerUserProps) {
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "createUser", {
    name:userInfo.userName,
    tenantName:"default",
    email:userInfo.email,
    identityId: userInfo.userId,
    password:userInfo.password,
    country:userInfo.country,
    phone:userInfo.phone,
  });

}


