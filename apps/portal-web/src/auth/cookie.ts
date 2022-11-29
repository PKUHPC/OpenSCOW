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

import { destroyCookie, parseCookies, setCookie } from "nookies";

// Cookie is of format

export const TOKEN_KEY = "SCOW_USER";
const COOKIE_PATH = "/";

export type ParseCookieContext = Parameters<typeof parseCookies>[0];
type SetCookieContext = Parameters<typeof setCookie>[0];

export function getTokenFromCookie(ctx?: ParseCookieContext): string | undefined {
  return parseCookies(ctx)[TOKEN_KEY] ?? undefined;
}

function setCookieWithAge(ctx: SetCookieContext, key: string, value: string) {
  setCookie(ctx, key, value, {
    maxAge: 30 * 24 * 60 * 60,
    path: COOKIE_PATH,
  });
}

export function setTokenCookie(ctx: SetCookieContext, token: string) {
  setCookieWithAge(ctx, TOKEN_KEY, token);
}

export function destroyUserInfoCookie(ctx: SetCookieContext) {
  destroyCookie(ctx, TOKEN_KEY, { path: COOKIE_PATH });
}

