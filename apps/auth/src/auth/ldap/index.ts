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
import ldapjs from "ldapjs";
import { AuthProvider } from "src/auth/AuthProvider";
import { createUser } from "src/auth/ldap/createUser";
import { extractUserInfoFromEntry, findUser, searchOne, useLdap } from "src/auth/ldap/helpers";
import { modifyPasswordAsSelf } from "src/auth/ldap/password";
import { registerPostHandler } from "src/auth/ldap/postHandler";
import { serveLoginHtml } from "src/auth/loginHtml";
import { authConfig } from "src/config/auth";
import { ensureNotUndefined } from "src/utils/validations";

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
    getUser: async (identityId, req) => useLdap(req.log, ldap)(async (client) => (
      findUser(req.log, ldap, client, identityId)
    )),
    createUser: async (info, req) => {
      return createUser(info, req, ldap);
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
