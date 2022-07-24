import { Logger } from "@ddadaal/tsgrpc-server";
import fs from "fs";
import { NodeSSH } from "node-ssh";
import { clusters } from "src/config/clusters";
import { privateKeyPath, publicKeyPath } from "src/config/mis";

const publicKey = fs.readFileSync(publicKeyPath, "utf-8").trim();

const clusterLoginNodes = Object.keys(clusters).reduce((prev, curr) => {
  prev[curr] = clusters[curr].loginNodes[0];
  return prev;
}, {} as Record<string, string>);


export const sshConnect = async <T>(
  host: string, username: string, privateKeyPath: string,
  run: (ssh: NodeSSH) => Promise<T>,
) => {

  const ssh = new NodeSSH();
  await ssh.connect({ host, username, privateKey: privateKeyPath });

  const value = await run(ssh).finally(() => ssh.dispose());

  return value;
};


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


  await Promise.allSettled(Object.entries(clusterLoginNodes).map(async ([name, ip]) => {

    logger.info("Adding key to user %s on cluster %s", user, name);

    await sshConnect(ip, "root", privateKeyPath, async (ssh) => {
      const homeDir = await ssh.execCommand(`eval echo ~${user}`);

      await ssh.execCommand(script(homeDir.stdout.trim()));
    });

  }));
}

