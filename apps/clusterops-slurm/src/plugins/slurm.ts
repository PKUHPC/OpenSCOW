import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { parseArray } from "@scow/config";
import { NodeSSH, SSHExecCommandResponse } from "node-ssh";
import { config } from "src/config";

export interface SlurmPlugin {
  executeSlurmScript: (cmds: string[]) => Promise<SSHExecCommandResponse>;
  executeScript: (cmd: string, parameters: string[], env?: NodeJS.ProcessEnv ) => Promise<SSHExecCommandResponse>;
}

export const slurmPlugin = plugin(async (s) => {

  const logger = s.logger.child({ plugin: "slurm" });

  const connect = async <T>(run: (ssh: NodeSSH) => Promise<T>) => {
    const ssh = new NodeSSH();
    await ssh.connect({ host: config.SLURM_NODE_URL, username: "root", privateKey: config.SSH_PRIVATE_KEY_PATH });

    const value = await run(ssh).finally(() => ssh.dispose());

    return value;
  };

  s.addExtension("executeScript", <SlurmPlugin["executeScript"]>(
    async (cmd, parameters, env) => {
      return await connect(async (ssh) => {
        const resp = await ssh.exec(cmd, parameters, { stream: "both", execOptions: { env } });

        logger.trace({ cmd: {
          cmd: [cmd, ...parameters].join(" "),
          code: resp.code,
          stdout: resp.stdout,
          stderr: resp.stderr,
        } }, "Command completed.");

        if (resp.code !== 0) {
          logger.error("Command %o failed. stdout %s, stderr %s",
            [cmd, ...parameters].join(" "), resp.stdout, resp.stderr);
          throw <ServiceError> {
            code: Status.INTERNAL,
            message: "Command execution failed.",
          };
        }

        return resp;
      });
    }
  ));

  const partitions = parseArray(config.BASE_PARTITIONS).map((x) => "\"" + x + "\"").join(" ");

  s.addExtension("executeSlurmScript",<SlurmPlugin["executeSlurmScript"]>(
    async (params: string[]) => {
      const result = await s.ext.executeScript(config.SLURM_SCRIPT_PATH, params, {
        MYSQL_PASSWORD: config.MYSQL_PASSWORD,
        BASE_PARTITIONS: partitions,
        ASSOC_TABLE: config.ASSOC_TABLE,
      });
      return result;
    }));
});

