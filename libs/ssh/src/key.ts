import fs from "fs";
import type { Logger } from "pino";

import { sshConnect } from "./ssh";
export interface KeyPair {
  publicKey: string;
  privateKey: string;
}

export function getKeyPair(privateKeyPath: string, publicKeyPath: string): KeyPair {
  return {
    privateKey: fs.readFileSync(privateKeyPath, "utf-8").trim(),
    publicKey: fs.readFileSync(publicKeyPath, "utf-8").trim(),
  };
}

/**
 * Insert the host's public key to the user's authorized_keys to enable public key login
 *
 * @param user the user
 * @param host the host of machine
 * @param rootKeyPair the key pair of root
 * @param logger the logger
 */
export async function insertKey(
  user: string, host: string, rootKeyPair: KeyPair, logger: Logger,
) {

  // https://superuser.com/a/484280
  const script = (homeDir: string) => `

    if ! [ -f "${homeDir}" ]; then
      mkdir -p "${homeDir}"
      chown "${user}:" "${homeDir}"
    fi

    if ! [ -f "${homeDir}/.ssh/authorized_keys" ]; then
      mkdir -p "${homeDir}/.ssh"
      touch "${homeDir}/.ssh/authorized_keys"

      chmod 700 "${homeDir}/.ssh"
      chmod 644 "${homeDir}/.ssh/authorized_keys"
      chown "${user}:" "${homeDir}/.ssh"
      chown "${user}:" "${homeDir}/.ssh/authorized_keys"
    fi

    if ! grep -q "${rootKeyPair.publicKey}" "${homeDir}/.ssh/authorized_keys"; then
      echo -e "${rootKeyPair.publicKey}\n" >> "${homeDir}/.ssh/authorized_keys"
    fi
    `;


  logger.info("Adding key to user %s to %s", user, host);

  await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    const homeDir = await ssh.execCommand(`eval echo ~${user}`);

    await ssh.execCommand(script(homeDir.stdout.trim()));
  });
}

