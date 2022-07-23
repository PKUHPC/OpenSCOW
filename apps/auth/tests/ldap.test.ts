import { FastifyInstance } from "fastify";
import { NoSuchObjectError } from "ldapjs";
import { buildApp } from "src/app";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { authConfig } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";

let server: FastifyInstance;

const { ldap } = ensureNotUndefined(authConfig, ["ldap"]);

beforeEach(async () => {
  server = await buildApp();

  await server.ready();
});

afterEach(async () => {
  await server.close();
});

it("creates user and group", async () => {

  const user = {
    mail: "test@test.com",
    id: 10,
    identityId: "123",
    name: "name",
    password: "12#",
  };

  const userDn = `${ldap.attrs.uid}=${user.identityId},${ldap.addUser.userBase}`;
  const groupDn = `${ldap.attrs.groupUserId}=${user.identityId},${ldap.addUser.groupBase}`;

  await useLdap(server.log, ldap)(async (client) => {

    function removeEvenNotExist(dn: string) {
      return new Promise<void>((res, rej) => {
        client.del(dn, (err) => {
          if (err) {
            if (err instanceof NoSuchObjectError) {
              console.log("No entity with dn " + userDn);
            } else {
              rej(err);
            }
          }
          res();
        });
      });
    }

    const removeUser = async () => {
      await removeEvenNotExist(userDn);
      await removeEvenNotExist(groupDn);
    };

    // remove the user if exists
    await removeUser();

    try {

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
    } finally {
      await removeUser();
    }

  });
});
