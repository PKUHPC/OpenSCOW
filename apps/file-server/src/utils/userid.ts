import { exec } from "child_process";

function execShellCommand(cmd: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
        return;
      }
      resolve(stdout);
    });
  });
}

/**
 * username must be validated, or shell injection might occur.
 */
export async function getuid(username: string): Promise<number> {
  return execShellCommand(`id -u ${username}`).then((x) => +x);
}

/**
 * username must be validated, or shell injection might occur.
 */
export async function getgid(username: string): Promise<number> {
  return execShellCommand(`id -g ${username}`).then((x) => +x);
}
