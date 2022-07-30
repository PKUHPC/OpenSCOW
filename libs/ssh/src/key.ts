import type { Logger } from "pino";

import { sshConnect } from "./ssh";

interface Node {
  host: string;
  name: string;
}

/**
 * Insert the host's public key to the user's authorized_keys to enable public key login
 *
 * @param user the user
 * @param hosts all the nodes that need to be inserted
 * @param privateKeyPath the path for private key
 * @param logger the logger
 */
export async function insertKey(
  user: string, hosts: Node[], privateKeyPath: string, publicKeyContent: string, logger: Logger,
) {
  // https://superuser.com/a/484280
  const script = (homeDir: string) => `

    if ! [ -f "${homeDir}" ]; then
      mkdir -p "${homeDir}"
      chown "${user}:${user}" "${homeDir}"
    fi

    if ! [ -f "${homeDir}/.ssh/authorized_keys" ]; then
      mkdir -p "${homeDir}/.ssh"
      touch "${homeDir}/.ssh/authorized_keys"

      chmod 700 "${homeDir}/.ssh"
      chmod 644 "${homeDir}/.ssh/authorized_keys"
      chown "${user}:${user}" "${homeDir}/.ssh"
      chown "${user}:${user}" "${homeDir}/.ssh/authorized_keys"
    fi

    if ! grep -q "${publicKeyContent}" "${homeDir}/.ssh/authorized_keys"; then
      echo "${publicKeyContent}" >> "${homeDir}/.ssh/authorized_keys"
    fi
    `;


  await Promise.all(hosts.map(async ({ name, host }) => {

    logger.info("Adding key to user %s on cluster %s", user, name);

    await sshConnect(host, "root", privateKeyPath, async (ssh) => {
      const homeDir = await ssh.execCommand(`eval echo ~${user}`);

      await ssh.execCommand(script(homeDir.stdout.trim()));
    });
  }));
}

