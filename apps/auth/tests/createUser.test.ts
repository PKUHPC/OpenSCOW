import { FastifyInstance } from "fastify";
import { NoSuchObjectError } from "ldapjs";
import { buildApp } from "src/app";
import { findUser, useLdap } from "src/auth/ldap/helpers";
import { config } from "src/config";

let server: FastifyInstance;

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

  const userDn = `${config.LDAP_ATTR_UID}=${user.identityId},${config.LDAP_ADD_USER_BASE}`;
  const groupDn = `${config.LDAP_ATTR_GROUP_USER_ID}=${user.identityId},${config.LDAP_ADD_GROUP_BASE}`;

  await useLdap(server.log)(async (client) => {

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

      const ldapUser = await findUser(server.log, client, user.identityId);
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
