import { parsePlaceholder } from "@scow/config";
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import { AuthProvider } from "src/auth/AuthProvider";
import { extractUserInfoFromEntry, findUser, searchOne, useLdap } from "src/auth/ldap/helpers";
import { modifyPassword, modifyPasswordAsSelf } from "src/auth/ldap/password";
import { registerPostHandler } from "src/auth/ldap/postHandler";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";
import { promisify } from "util";

export const createLdapAuthProvider = (f: FastifyInstance) => {

  const { ldap } = ensureNotUndefined(authConfig, ["ldap"]);

  registerPostHandler(f, ldap);

  return <AuthProvider>{
    serveLoginHtml: (callbackUrl, req, rep) => serveLoginHtml(false, callbackUrl, req, rep),
    fetchAuthTokenInfo: async () => undefined,
    validateName: ldap.attrs.name
      ? async (identityId, name, req) => {
      // Use LDAP to query a user with identityId and name
        return useLdap(req.log, ldap)(async (client) => {
          const user = await searchOne(req.log, client, ldap.searchBase,
            {
              scope: "sub",
              filter: new ldapjs.AndFilter({
                filters: [
                  ldapjs.parseFilter(ldap.userFilter),
                  new ldapjs.EqualityFilter({
                    attribute: ldap.attrs.uid,
                    value: identityId,
                  }),
                ],
              }),
            }, (e) => extractUserInfoFromEntry(ldap, e),
          );

          if (!user) {
            return "NotFound";
          }

          if (user.name !== name) {
            return "NotMatch";
          }

          return "Match";
        });
      } : undefined,
    createUser: async (info, req) => {
      const id = info.id + ldap.addUser.uidStart;

      await useLdap(req.log, ldap)(async (client) => {
        const peopleDn = `${ldap.attrs.uid}=${info.identityId},${ldap.addUser.userBase}`;
        const peopleEntry: Record<string, string | string[] | number> = {
          [ldap.attrs.uid]: info.identityId,
          sn: info.identityId,
          loginShell: "/bin/bash",
          objectClass: ["inetOrgPerson", "posixAccount", "shadowAccount"],
          homeDirectory: parsePlaceholder(ldap.addUser.homeDir, { userId: info.identityId }),
          uidNumber: id,
          gidNumber: id,
        };

        if (ldap.attrs.name) {
          peopleEntry[ldap.attrs.name] = info.name;
        }

        if (ldap.attrs.mail) {
          peopleEntry[ldap.attrs.mail] = info.mail;
        }

        // parse attributes
        if (ldap.addUser.extraProps) {
          for (const key in ldap.addUser.extraProps) {
            const value = ldap.addUser.extraProps[key];
            if (Array.isArray(value)) {
              peopleEntry[key] = value.map((x) => parsePlaceholder(x, peopleEntry));
            } else {
              peopleEntry[key] = parsePlaceholder(value, peopleEntry);
            } 
          }
        }

        const groupDn = `${ldap.attrs.groupUserId}=${info.identityId},${ldap.addUser.groupBase}`;
        const groupEntry = {
          objectClass: ["posixGroup"],
          memberUid: info.identityId,
          gidNumber: id,
        };

        const add = promisify(client.add.bind(client));

        req.log.info("Adding people %s with entry info %o", peopleDn, peopleEntry);
        await add(peopleDn, peopleEntry);

        req.log.info("Adding group %s with entry info %o", groupDn, groupEntry);
        await add(groupDn, groupEntry);

        // set password as admin user
        await modifyPassword(peopleDn, undefined, info.password, client);

        const addUserToGroup = ldap.addUser.userToGroup;
        if (addUserToGroup) {
          // get existing members
          req.log.info("Adding %s to group %s", peopleDn, addUserToGroup);

          const members = await searchOne(req.log, client, addUserToGroup, {
            attributes: ["member"],
          }, (entry) => {
            const member = entry.attributes.find((x) => x.json.type === "member");
            if (!member) {
              return undefined;
            }

            return { members: member.json.vals };
          });

          if (!members) {
            req.log.error("Didn't find group %s", addUserToGroup);
            throw { code: "INTERNAL_ERROR" };
          }

          // add the dn of the new user to the value
          const modify = promisify(client.modify.bind(client));
          await modify(addUserToGroup, new ldapjs.Change({
            operation: "add",
            modification: {
              "member": members.members.concat(peopleDn),
            },
          }));
        }


      });

      return "OK";
    },
    changePassword: async (id, oldPassword, newPassword, req) => {
      return useLdap(req.log, ldap)(async (client) => {
        const user = await findUser(req.log, ldap, client, id);
        if (!user) {
          return "NotFound";
        }

        const result = await modifyPasswordAsSelf(req.log, ldap, user.dn, oldPassword, newPassword);
        return result ? "OK" : "WrongOldPassword";
      });
    },
  };

};
