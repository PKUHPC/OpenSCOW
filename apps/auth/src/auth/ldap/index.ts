import { parsePlaceholder } from "@scow/config";
import { FastifyInstance } from "fastify";
import ldapjs from "ldapjs";
import { AuthProvider } from "src/auth/AuthProvider";
import { extractUserInfoFromEntry, findUser, searchOne, useLdap } from "src/auth/ldap/helpers";
import { modifyPassword, modifyPasswordAsSelf } from "src/auth/ldap/password";
import { registerPostHandler } from "src/auth/ldap/postHandler";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig, NewUserGroupStrategy } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";
import { promisify } from "util";

/**
 * Apply extra props.
 * @param obj the object to apply extra props
 * @param extraProps the extraProps config
 * @param placeholderObj the object where the values of placeholders ({{ }}) are from
 */
const applyExtraProps = (obj: object, extraProps: Record<string, string | string[]>, placeholderObj: object) => {

  for (const key in extraProps) {
    const value = extraProps[key];
    if (Array.isArray(value)) {
      obj[key] = value.map((x) => parsePlaceholder(x, placeholderObj));
    } else {
      obj[key] = parsePlaceholder(value, placeholderObj);
    }
  }

};

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
            }, (e) => extractUserInfoFromEntry(ldap, e, req.log),
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
        const userDn =
          `${ldap.addUser.userIdDnKey ?? ldap.attrs.uid}=${info.identityId},` +
          `${ldap.addUser.userBase}`;
        const userEntry: Record<string, string | string[] | number> = {
          [ldap.attrs.uid]: info.identityId,
          sn: info.identityId,
          loginShell: "/bin/bash",
          objectClass: ["inetOrgPerson", "posixAccount", "shadowAccount"],
          homeDirectory: parsePlaceholder(ldap.addUser.homeDir, { userId: info.identityId }),
          uidNumber: id,
          gidNumber: id,
        };

        if (ldap.attrs.name) {
          userEntry[ldap.attrs.name] = info.name;
        }

        if (ldap.attrs.mail) {
          userEntry[ldap.attrs.mail] = info.mail;
        }

        // parse attributes
        if (ldap.addUser.extraProps) {
          applyExtraProps(userEntry, ldap.addUser.extraProps, userEntry);
        }

        const add = promisify(client.add.bind(client));


        if (ldap.addUser.groupStrategy === NewUserGroupStrategy.newGroupPerUser) {

          req.log.info("ldap.addUser.groupStrategy is newGroupPerUser. Creating new group for the user.");

          const config = ldap.addUser.newGroupPerUser!;

          const groupDn = `${config.groupIdDnKey ?? ldap.attrs.uid}=${info.identityId},${config.groupBase}`;
          const groupEntry = {
            objectClass: ["posixGroup"],
            memberUid: info.identityId,
            gidNumber: id,
          };

          userEntry["gidNumber"] = id;

          if (config.extraProps) {
            applyExtraProps(groupEntry, config.extraProps, userEntry);
          }

          req.log.info("Adding group %s with entry info %o", groupDn, groupEntry);
          await add(groupDn, groupEntry);

        }

        if (ldap.addUser.groupStrategy === NewUserGroupStrategy.oneGroupForAllUsers) {
          const config = ldap.addUser.oneGroupForAllUsers!;

          req.log.info("ldap.addUser.groupStrategy is one-group-for-all-users.");
          req.log.info("Using existing group %s for the user", config.gidNumber);

          userEntry["gidNumber"] = config.gidNumber;
        }

        req.log.info("Adding people %s with entry info %o", userDn, userEntry);
        await add(userDn, userEntry);

        // set password as admin user
        await modifyPassword(userDn, undefined, info.password, client);

        // Add user to ldap group
        const addUserToLdapGroup = ldap.addUser.addUserToLdapGroup;

        if (addUserToLdapGroup) {
          // get existing members
          req.log.info("Adding %s to group %s", userDn, addUserToLdapGroup);

          const members = await searchOne(req.log, client, addUserToLdapGroup, {
            attributes: ["member"],
          }, (entry) => {
            const member = entry.attributes.find((x) => x.json.type === "member");
            if (!member) {
              return undefined;
            }

            return { members: member.json.vals };
          });

          if (!members) {
            req.log.error("Didn't find LDAP group %s", addUserToLdapGroup);
            throw { code: "INTERNAL_ERROR" };
          }

          // add the dn of the new user to the value
          const modify = promisify(client.modify.bind(client));
          await modify(addUserToLdapGroup, new ldapjs.Change({
            operation: "add",
            modification: {
              "member": members.members.concat(userDn),
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
