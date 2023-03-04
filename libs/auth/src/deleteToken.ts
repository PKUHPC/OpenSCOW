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

// import { jsonFetch } from "@ddadaal/next-typed-api-routes-runtime";
// import path from "path";

// interface deleteTokenSchema {
//     query: { token: string },
//     responses: { 204: null }
// }

// export async function deleteToken(token: string, authUrl: string) {
//   await jsonFetch<deleteTokenSchema>({
//     method: "DELETE",
//     path: path.join(authUrl, "/token"),
//     query: { token },
//   });
// }

import { applicationJsonHeaders } from "./utils";


export async function deleteToken(token: string, authUrl: string) {
  await fetch(authUrl + "/token", {
    method: "DELETE",
    body: JSON.stringify(token),
    headers: applicationJsonHeaders,
  });
}

