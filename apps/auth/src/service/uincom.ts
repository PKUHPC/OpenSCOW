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

interface GetTokenParams {
  client_id: string,
  client_secret: string,
  code: string,
  redirect_uri: string,
}

export async function getUnicomToken(fetchUrl: string, params: GetTokenParams) {

<<<<<<< HEAD
  return await fetch(fetchUrl, {
=======
  return fetch(fetchUrl, {
>>>>>>> 9701eaf1bd (feat:unicom三方登录)
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ ...params, grant_type: "authorization_code" }).toString(),
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
}
<<<<<<< HEAD

export async function getUnicomUserInfo(fetchUrl: string, accessToken: string) {

  return await fetch(fetchUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
}

export async function unicomUserLogout(fetchUrl: string, accessToken: string) {

  return await fetch(fetchUrl, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
    },
  })
    .then((response) => response.json())
    .catch((error) => console.error("Error:", error));
}
=======
>>>>>>> 9701eaf1bd (feat:unicom三方登录)
