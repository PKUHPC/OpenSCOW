import { Logger } from "@ddadaal/tsgrpc-server";
import fs from "fs";
import { NodeSSH } from "node-ssh";
import { config , INSERT_SSH_KEY_LOGIN_NODES } from "src/config/env";

const connectAsRoot = async <T>(ip: string, run: (ssh: NodeSSH) => Promise<T>) => {

  const ssh = new NodeSSH();

  return await ssh.connect({
    username: "root", host: ip, privateKey: config.INSERT_SSH_KEY_PRIVATE_KEY_PATH,
  })
    .then(run)
    .finally(() => ssh.dispose());

};

const publicKey = fs.readFileSync(config.INSERT_SSH_KEY_PUBLIC_KEY_PATH, "utf-8").trim();

export async function insertKey(user: string, logger: Logger) {
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

    if ! grep -q "${publicKey}" "${homeDir}/.ssh/authorized_keys"; then
      echo "${publicKey}" >> "${homeDir}/.ssh/authorized_keys"
    fi
    `;


  await Promise.allSettled(Object.entries(INSERT_SSH_KEY_LOGIN_NODES).map(async ([name, ip]) => {

    logger.info("Adding key to user %s on cluster %s", user, name);

    await connectAsRoot(ip, async (ssh) => {
      const homeDir = await ssh.execCommand(`eval echo ~${user}`);

      await ssh.execCommand(script(homeDir.stdout.trim()));
    });

  }));
}

