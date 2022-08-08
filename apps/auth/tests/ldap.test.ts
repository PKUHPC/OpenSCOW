import { FastifyInstance } from "fastify";
import { Client, createClient, NoSuchObjectError } from "ldapjs";
import { buildApp } from "src/app";
import { findUser } from "src/auth/ldap/helpers";
import { authConfig } from "src/config/auth";
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

const userDn = `${ldap.attrs.uid}=${user.identityId},${ldap.addUser.userBase}`;
const groupDn = `${ldap.attrs.groupUserId}=${user.identityId},${ldap.addUser.groupBase}`;

beforeEach(async () => {
  server = await buildApp();

  await server.ready();

  client = createClient({ url: ldap.url, log: server.log });
  await promisify(client.bind.bind(client))(ldap.bindDN, ldap.bindPassword);
});


async function removeUser(client: Client) {
  function removeEvenNotExist(dn: string) {
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

  await removeEvenNotExist(userDn);
  await removeEvenNotExist(groupDn);
}


afterEach(async () => {
  await removeUser(client);
  client.destroy();

  await server.close();


});

it("creates user and group", async () => {

  const resp = await server.inject({
    method: "POST",
    url: "/user",
    payload: user,
  });

  expect(resp.statusCode).toBe(204);

  const ldapUser = await findUser(server.log, ldap, client, user.identityId);
  expect(ldapUser).toBeDefined();

  expect(ldapUser).toEqual({
    dn: userDn,
    identityId: user.identityId,
    name: user.name,
  });

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
