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
import type { NextApiRequest, NextApiResponse, NextPageContext } from "next";
import { getTokenFromCookie } from "src/auth/cookie";
import type { Check } from "src/auth/requireAuth";
import { validateToken } from "src/auth/token";
import type { UserInfo } from "src/models/User";

type RequestType = IncomingMessage | NextApiRequest | NextPageContext["req"];

export type AuthResultError = 401 | 403;

export async function checkCookie(check: Check, req: RequestType): Promise<AuthResultError | UserInfo> {
  const token = getTokenFromCookie({ req });

  const result = await validateToken(token);

  if (!result) {
    return 401;
  }

  if (!check(result)) {
    return 403;
  }

  return result;
}

export type SSRProps<T, TExtraErrorCode = never> = {
  error: AuthResultError | TExtraErrorCode;
} | T;

export const ssrAuthenticate = (check: Check) =>
  async (req: NextPageContext["req"]) => {
    return await checkCookie(check, req);
  };

export const authenticate = (check: Check) =>
  async (req: NextApiRequest, res: NextApiResponse): Promise<undefined | UserInfo> => {
    const result = await checkCookie(check, req);

    if (typeof result === "number") {
      res.status(result).send(undefined);
      return undefined;
    } else {
      return result;
    }
  };
