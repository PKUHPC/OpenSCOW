/**
 * References
 * https://datatracker.ietf.org/doc/html/rfc3062
 * https://stackoverflow.com/questions/65745679/how-do-i-pass-parameters-to-the-ldapjs-exop-function
 */

import { BerWriter } from "asn1";
import { FastifyLoggerInstance } from "fastify";
import ldapjs from "ldapjs";
import { useLdap } from "src/auth/ldap/helpers";
import { promisify } from "util";

function handleIfInvalidCredentials(e: any) {
  if (e.message === "Invalid Credentials") {
    return false;
  } else {
    throw e;
  }
}

export async function modifyPassword(
  userId: string, oldPassword: string | undefined, newPassword: string, client: ldapjs.Client,
): Promise<boolean> {
  /** Must bind as the user whose password is to be changed and then password can be changed */
  try {
    const CTX_SPECIFIC_CLASS = 0b10 << 6;
    const writer = new BerWriter();
    writer.startSequence();
    writer.writeString(userId, CTX_SPECIFIC_CLASS | 0); // sequence item number 0
    if (oldPassword) {
      writer.writeString(oldPassword, CTX_SPECIFIC_CLASS | 1); // sequence item number 1
    }
    writer.writeString(newPassword, CTX_SPECIFIC_CLASS | 2); // sequence item number 2
    writer.endSequence();

    await promisify(client.exop.bind(client))("1.3.6.1.4.1.4203.1.11.1", writer.buffer);
    return true;
  } catch (e: any) {
    return handleIfInvalidCredentials(e);
  }

}

export async function modifyPasswordAsSelf(
  log: FastifyLoggerInstance,
  userDn: string, oldPassword: string, newPassword: string,
) : Promise<boolean> {
  try {
    return await useLdap(log, { dn: userDn, password: oldPassword })(async (client) => {
      await modifyPassword(userDn, oldPassword, newPassword, client);
      return true;
    });
  } catch (e: any) {
    return handleIfInvalidCredentials(e);
  }
}
