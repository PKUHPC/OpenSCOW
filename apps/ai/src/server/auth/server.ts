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

import { IncomingMessage } from "http";
import { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { NextRequest } from "next/server";
import { deleteUserToken, getUserToken } from "src/server/auth/cookie";
import { ClientUserInfo } from "src/server/trpc/route/auth";
import { USE_MOCK } from "src/utils/processEnv";

import { validateToken } from "./token";

export const mockUserInfo: ClientUserInfo = {
  identityId: "demo_admin",
  name:"mock-user",
  token: "demo_admin",
};

type RequestType = IncomingMessage | NextApiRequest | NextRequest | NextPageContext["req"];

export async function getUserInfo(req: RequestType, res?: NextApiResponse): Promise<ClientUserInfo | undefined> {

  const token = getUserToken(req);
  if (!token) { return undefined; }

  if (USE_MOCK) {
    return mockUserInfo;
  }

  const result = await validateToken(token);


  if (!result?.identityId) {
    deleteUserToken(res);
    return;
  }

  return { ...result, token };

}

