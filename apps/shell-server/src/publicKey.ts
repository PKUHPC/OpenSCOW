import { Static,Type } from "@sinclair/typebox";
import { exec, ExecException } from "child_process";
import { FastifyLoggerInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import { clusters, config } from "src/config";


// check if ssh public key exists
if (!fs.existsSync(config.SSH_PUBLIC_KEY_PATH)) {
  throw new Error(`No public key exists at ${config.SSH_PUBLIC_KEY_PATH}`);
}

const publicKey = fs.readFileSync(config.SSH_PUBLIC_KEY_PATH, "utf-8").trim();


interface ShellCommandResult {
  error: ExecException | null;
  stdout: string;
  stderr: string;
}

function execShellCommand(cmd: string): Promise<ShellCommandResult> {
  return new Promise((resolve) => {
    exec(cmd, (error, stdout, stderr) => {
      resolve({ error, stdout, stderr });
    });
  });
}

async function execAsRoot(script: string, ip: string) {
  const cmd = `ssh -i "${config.SSH_PRIVATE_KEY_PATH.replace("\"", "'")}" root@${ip} << EOF
  ${script}
EOF`;
  return await execShellCommand(cmd);
}


export async function insertKey(user: string, logger: FastifyLoggerInstance) {
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


  await Promise.allSettled(Object.entries(clusters).map(async ([name, ip]) => {

    logger.info("Adding key to user %s on cluster %s", user, name);

    const homeDir = await execAsRoot(`eval echo ~${user}`, ip);

    await execAsRoot(script(homeDir.stdout.trim()), ip);
  }));
}

const HeadersSchema = Type.Object({
  authorization: Type.String({ description: "token" }),
});

const BodySchema = Type.Object({
  user: Type.String({ description: "用户名" }),
});

const ResponsesSchema = Type.Object({
  403: Type.Null({ description: "token无效" }),
});

export const publicKeyPlugin = fp(async (f) => {
  f.post<{
    Header: Static<typeof HeadersSchema>,
    Body: Static<typeof BodySchema>,
    Reply: Static<typeof ResponsesSchema>,
  }>("/publicKey", {
    schema: {
      headers: HeadersSchema,
      body: BodySchema,
      response: ResponsesSchema.properties,
    },
  }, async (req, res) => {

    const token = req.headers.authorization;

    if (token !== config.ADMIN_KEY) {
      return await res.code(403).send();
    }

    const user = req.body.user;

    req.log.info("Received public key insertion request for %s", user);

    await insertKey(user, req.log);

    return await res.code(204).send();
  });
});

