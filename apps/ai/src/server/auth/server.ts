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

import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { NextRequest } from "next/server.js";
import { deleteUserToken, getUserToken } from "src/server/auth/cookie.js";
import { ClientUserInfo } from "src/server/auth/models.js";
import { USE_MOCK } from "src/utils/mock.js";

export const mockUserInfo: ClientUserInfo = {
  identityId: "123",
  accountId: 12,
  phone:"13121812324",
  email:"123@qq.com",
  createTime:"2023-9-6 14:19:47",
  token: "123",
};

type RequestType = IncomingMessage | NextApiRequest | NextRequest | NextPageContext["req"];

export async function getUserInfo(req: RequestType, res?: NextApiResponse): Promise<ClientUserInfo | undefined> {

  const token = getUserToken(req);
  if (!token) { return undefined; }

  if (USE_MOCK) {
    return mockUserInfo;
  }

  // const client = getClient(AuthenticationServiceClient);

  // const resp = await asyncUnaryCall(client, "getUserInfo", { token }).catch((e) => {
  //   if (e.code === status.UNAUTHENTICATED) {
  //     return undefined;
  //   } else {
  //     throw e;
  //   }
  // });

  const resp = { info: { ...mockUserInfo } };
  if (!resp || !resp.info) {
    // the token is invalid. destroy the cookie
    if (res) {
      deleteUserToken(res);
    }
    return undefined;
  }
  return { ...resp.info, token };

}

