import { parseKeyValue, parsePlaceholder } from "@scow/config";
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import { AuthProvider } from "src/auth/AuthProvider";
import { extractUserInfoFromEntry, findUser, searchOne, useLdap } from "src/auth/ldap/helpers";
import { modifyPassword, modifyPasswordAsSelf } from "src/auth/ldap/password";
import { registerPostHandler } from "src/auth/ldap/postHandler";
import { serveLoginHtml } from "src/auth/loginHtml";
import { config } from "src/config/env";
import { ensureNotUndefined } from "src/utils/validations";
import { promisify } from "util";

const addAttributes = parseKeyValue(config.LDAP_ADD_ATTRS);

export const createLdapAuthProvider = (f: FastifyInstance) => {

  ensureNotUndefined(config, [
    "LDAP_URL", "LDAP_SEARCH_BASE", "LDAP_FILTER", "LDAP_ADD_USER_BASE", "LDAP_ADD_GROUP_BASE",
    "LDAP_ATTR_GROUP_USER_ID", "LDAP_ATTR_UID",
  ]);

  registerPostHandler(f);

  return <AuthProvider>{
    serveLoginHtml: (callbackUrl, req, rep) => serveLoginHtml(false, callbackUrl, req, rep),
    fetchAuthTokenInfo: async () => undefined,
    validateName: config.LDAP_ATTR_NAME
      ? async (identityId, name, req) => {
      // Use LDAP to query a user with identityId and name
        return useLdap(req.log)(async (client) => {
          const user = await searchOne(req.log, client, config.LDAP_SEARCH_BASE,
            {
              scope: "sub",
              filter: new ldapjs.AndFilter({
                filters: [
                  ldapjs.parseFilter(config.LDAP_FILTER),
                  new ldapjs.EqualityFilter({
                    attribute: config.LDAP_ATTR_UID,
                    value: identityId,
                  }),
                ],
              }),
            }, extractUserInfoFromEntry,
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
      const id = info.id + config.LDAP_ADD_UID_START;

      await useLdap(req.log)(async (client) => {
        const peopleDn = `${config.LDAP_ATTR_UID}=${info.identityId},${config.LDAP_ADD_USER_BASE}`;
        const peopleEntry: Record<string, string | string[] | number> = {
          [config.LDAP_ATTR_UID]: info.identityId,
          sn: info.identityId,
          loginShell: "/bin/bash",
          objectClass: ["inetOrgPerson", "posixAccount", "shadowAccount"],
          homeDirectory: parsePlaceholder(config.LDAP_ADD_HOME_DIR, { userId: info.identityId }),
          uidNumber: id,
          gidNumber: id,
        };

        if (config.LDAP_ATTR_NAME) {
          peopleEntry[config.LDAP_ATTR_NAME] = info.name;
        }

        if (config.LDAP_ATTR_MAIL) {
          peopleEntry[config.LDAP_ATTR_MAIL] = info.mail;
        }

        // parse attributes
        for (const key in addAttributes) {
          const value = addAttributes[key];
          if (value.includes(":")) {
            peopleEntry[key] = value.split(":").map((x) => parsePlaceholder(x, peopleEntry));
          } else {
            peopleEntry[key] = parsePlaceholder(addAttributes[key], peopleEntry);
          }
        }

        const groupDn = `${config.LDAP_ATTR_GROUP_USER_ID}=${info.identityId},${config.LDAP_ADD_GROUP_BASE}`;
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

        if (config.LDAP_ADD_USER_TO_GROUP) {
          // get existing members
          req.log.info("Adding %s to group %s", peopleDn, config.LDAP_ADD_USER_TO_GROUP);

          const members = await searchOne(req.log, client, config.LDAP_ADD_USER_TO_GROUP, {
            attributes: ["member"],
          }, (entry) => {
            const member = entry.attributes.find((x) => x.json.type === "member");
            if (!member) {
              return undefined;
            }

            return { members: member.json.vals };
          });

          if (!members) {
            req.log.error("Didn't find group %s", config.LDAP_ADD_USER_TO_GROUP);
            throw { code: "INTERNAL_ERROR" };
          }

          // add the dn of the new user to the value
          const modify = promisify(client.modify.bind(client));
          await modify(config.LDAP_ADD_USER_TO_GROUP, new ldapjs.Change({
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
      return useLdap(req.log)(async (client) => {
        const user = await findUser(req.log, client, id);
        if (!user) {
          return "NotFound";
        }

        const result = await modifyPasswordAsSelf(req.log, user.dn, oldPassword, newPassword);
        return result ? "OK" : "WrongOldPassword";
      });
    },
  };

};
