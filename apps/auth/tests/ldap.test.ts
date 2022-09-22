import { FastifyInstance } from "fastify";
import { Client, createClient, NoSuchObjectError, SearchEntry } from "ldapjs";
import { buildApp } from "src/app";
import { extractAttr, findUser, searchOne, takeOne } from "src/auth/ldap/helpers";
import { authConfig, NewUserGroupStrategy } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";
import { createFormData } from "tests/utils";
import { promisify } from "util";

let server: FastifyInstance;

const { ldap } = ensureNotUndefined(authConfig, ["ldap"]);
let client: Client;

const user = {
  mail: "test@test.com",
  id: 10,
  identityId: "123",
  name: "name",
  password: "12#",
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

it("creates user and group if groupStrategy is new-group-per-user", async () => {

  ldap.addUser.groupStrategy = NewUserGroupStrategy["new-group-per-user"];

  const resp = await server.inject({
    method: "POST",
    url: "/user",
    payload: user,
  });

  expect(resp.statusCode).toBe(204);

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

it("creates only user if groupStrategy is one-group-for-all-users", async () => {
  ldap.addUser.groupStrategy = NewUserGroupStrategy["one-group-for-all-users"];

  const resp = await server.inject({
    method: "POST",
    url: "/user",
    payload: user,
  });

  expect(resp.statusCode).toBe(204);

  const ldapUser = await searchByDn(client, userDn);
  if (!ldapUser) { fail("response user is not defined"); }

  const uid = ldap.addUser.uidStart + user.id + "";

  expect(extractOne(ldapUser, "uidNumber")).toBe(uid);
  expect(extractOne(ldapUser, "gidNumber")).toBe(1000 + "");

});

it("should login with correct username and password", async () => {
  {
    const resp = await server.inject({
      method: "POST",
      url: "/user",
      payload: user,
    });

    expect(resp.statusCode).toBe(204);
  }

  const callbackUrl = "/callback";

  // login
  {
    const { payload, headers } = createFormData({
      username: user.identityId,
      password: user.password,
      callbackUrl,
    });

    const resp = await server.inject({
      method: "POST",
      url: "/public/auth",
      payload,
      headers,
    });

    expect(resp.statusCode).toBe(302);
    expect(resp.headers.location).toStartWith(callbackUrl + "?");
  }
});

it("should not login with wrong password", async () => {
  {
    const resp = await server.inject({
      method: "POST",
      url: "/user",
      payload: user,
    });

    expect(resp.statusCode).toBe(204);
  }

  const callbackUrl = "/callback";

  // login
  {
    const { payload, headers } = createFormData({
      username: user.identityId,
      password: user.password + "0",
      callbackUrl,
    });

    const resp = await server.inject({
      method: "POST",
      url: "/public/auth",
      payload,
      headers,
    });

    expect(resp.statusCode).toBe(403);
  }
});
