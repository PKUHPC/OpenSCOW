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

import { FastifyInstance } from "fastify";
import { Client, createClient, NoSuchObjectError, SearchEntry } from "ldapjs";
import { buildApp } from "src/app";
import { saveCaptchaText } from "src/auth/captcha";
import { extractAttr, findUser, searchOne, takeOne } from "src/auth/ldap/helpers";
import { authConfig, NewUserGroupStrategy } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";
import { allowedCallbackUrl, createFormData } from "tests/utils";
import { promisify } from "util";

let server: FastifyInstance;

const callbackUrl = allowedCallbackUrl;

const { ldap } = ensureNotUndefined(authConfig, ["ldap"]);
let client: Client;

const user = {
  mail: "test@test.com",
  id: 10,
  identityId: "123",
  name: "name",
  password: "12#",
  captchaToken: "captchaToken",
  captchaCode: "captchaCode",
};

const userDn = `${ldap.addUser.userIdDnKey}=${user.identityId},${ldap.addUser.userBase}`;
const groupDn =
  `${ldap.addUser.newGroupPerUser!.groupIdDnKey}=${user.identityId},`
  + `${ldap.addUser.newGroupPerUser!.groupBase}`;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();

  client = createClient({ url: ldap.url, log: server.log });
  await promisify(client.bind.bind(client))(ldap.bindDN, ldap.bindPassword);
});

function extractOne(entry: SearchEntry, property: string) {
  return takeOne(extractAttr(entry, property));
}

async function removeEvenNotExist(client: Client, dn: string) {
  return new Promise<void>((res, rej) => {
    client.del(dn, (err) => {
      if (err) {
        if (err instanceof NoSuchObjectError) {
          console.log("No entity with dn " + dn);
        } else {
          rej(err);
        }
      }
      res();
    });
  });
}


afterEach(async () => {
  await removeEvenNotExist(client, userDn);
  await removeEvenNotExist(client, groupDn);
  client.destroy();

  await server.close();


});

async function searchByDn(client: Client, dn: string) {
  return searchOne(server.log, client, dn, { scope: "base" }, (e) => e);
}

const createUser = async () => {
  const resp = await server.inject({
    method: "POST",
    url: "/user",
    payload: user,
  });

  expect(resp.statusCode).toBe(204);

};

it("creates user and group if groupStrategy is newGroupPerUser", async () => {

  ldap.addUser.groupStrategy = NewUserGroupStrategy.newGroupPerUser;

  await createUser();

  const responseUser = await findUser(server.log, ldap, client, user.identityId);

  expect(responseUser).toEqual({
    dn: userDn,
    identityId: user.identityId,
    name: user.name,
  });

  const ldapUser = await searchByDn(client, userDn);
  if (!ldapUser) { fail("response user is not defined"); }


  const uid = ldap.addUser.uidStart + user.id + "";

  expect(extractOne(ldapUser, "uidNumber")).toBe(uid);
  expect(extractOne(ldapUser, "gidNumber")).toBe(uid);
  expect(extractOne(ldapUser, "uid")).toBe(user.identityId);
  expect(extractOne(ldapUser, "cn")).toBe(user.name);
  expect(extractOne(ldapUser, "mail")).toBe(`mail is ${user.mail}`);

  const ldapGroup = await searchByDn(client, groupDn);
  if (!ldapGroup) { fail("response group is not defined"); }

  expect(ldapGroup.dn).toBe(groupDn);
  expect(extractOne(ldapGroup, "memberUid")).toBe(user.identityId);

});


it("creates only user if groupStrategy is oneGroupForAllUsers", async () => {
  ldap.addUser.groupStrategy = NewUserGroupStrategy.oneGroupForAllUsers;

  await createUser();

  const ldapUser = await searchByDn(client, userDn);
  if (!ldapUser) { fail("response user is not defined"); }

  const uid = ldap.addUser.uidStart + user.id + "";

  expect(extractOne(ldapUser, "uidNumber")).toBe(uid);
  expect(extractOne(ldapUser, "gidNumber")).toBe(1000 + "");

});

it("returns correct error if user already exists", async () => {
  await createUser();

  const resp = await server.inject({
    method: "POST",
    url: "/user",
    payload: user,
  });

  expect(resp.statusCode).toBe(409);

});

it("test to input a wrong verifyCaptcha", async () => {
  await createUser();



  // login
  const { payload, headers } = createFormData({
    username: user.identityId,
    password: user.password,
    callbackUrl,
    token: user.captchaToken,
    code: "wrongCaptcha",
  });
  await saveCaptchaText(server, user.captchaCode, user.captchaToken);
  const resp = await server.inject({
    method: "POST",
    url: "/public/auth",
    payload,
    headers,
  });
  expect(resp.statusCode).toBe(400);
});

it("should login with correct username and password", async () => {

  await createUser();



  // login
  const { payload, headers } = createFormData({
    username: user.identityId,
    password: user.password,
    callbackUrl,
    token: user.captchaToken,
    code: user.captchaCode,
  });
  await saveCaptchaText(server, user.captchaCode, user.captchaToken);
  const resp = await server.inject({
    method: "POST",
    url: "/public/auth",
    payload,
    headers,
  });


  expect(resp.statusCode).toBe(302);
  expect(resp.headers.location).toStartWith(callbackUrl + "?");
});

it("should not login with wrong password", async () => {

  await createUser();



  // login
  const { payload, headers } = createFormData({
    username: user.identityId,
    password: user.password + "0",
    callbackUrl,
    token: user.captchaToken,
    code: user.captchaCode,
  });
  await saveCaptchaText(server, user.captchaCode, user.captchaToken);
  const resp = await server.inject({
    method: "POST",
    url: "/public/auth",
    payload,
    headers,
  });

  expect(resp.statusCode).toBe(401);
});

it("gets user info", async () => {
  await createUser();

  const resp = await server.inject({
    method: "GET",
    url: "/user",
    query: { identityId: user.identityId },
  });

  expect(resp.statusCode).toBe(200);
  expect(resp.json()).toEqual({ user: { identityId: user.identityId } });
});

it("returns 404 if user doesn't exist", async () => {
  const resp = await server.inject({
    method: "GET",
    url: "/user",
    query: { identityId: user.identityId },
  });

  expect(resp.statusCode).toBe(404);
  expect(resp.json()).toEqual({ code: "USER_NOT_FOUND" });
});
