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

/**
 * References
 * https://datatracker.ietf.org/doc/html/rfc3062
 * https://stackoverflow.com/questions/65745679/how-do-i-pass-parameters-to-the-ldapjs-exop-function
 */

import { FastifyBaseLogger } from "fastify";
import ldapjs from "ldapjs";
import { useLdap } from "src/auth/ldap/helpers";
import { LdapConfigSchema } from "src/config/auth";
import { promisify } from "util";

function handleIfInvalidCredentials(e: any) {
  if (e.message === "Invalid Credentials") {
    return false;
  } else {
    throw e;
  }
}

export async function modifyEmail(
  userId: string, newEmail: string, client: ldapjs.Client,
): Promise<boolean> {

  try {
    const modify = promisify(client.modify.bind(client));
    await modify(userId, new ldapjs.Change({
      operation: "replace",
      modification: {
        "mail": newEmail,
      },
    }),
    );
    return true;

  } catch (e: any) {
    return handleIfInvalidCredentials(e);
  }
}

export async function modifyEmailAsSelf(
  log: FastifyBaseLogger,
  ldap: LdapConfigSchema,
  userDn: string, newEmail: string,
): Promise<boolean> {
  try {

    return await useLdap(log, ldap)(async (client) => {

      await modifyEmail(userDn, newEmail, client);
      return true;
    });
  } catch (e: any) {
    return handleIfInvalidCredentials(e);
  }
}
