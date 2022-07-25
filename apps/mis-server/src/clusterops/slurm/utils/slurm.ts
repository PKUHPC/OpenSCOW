import { Logger } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { SlurmMisConfigSchema } from "@scow/config/build/appConfig/mis";
import { privateKeyPath } from "src/config/mis";
import { sshConnect } from "src/utils/ssh";

export const executeScript = async (
  slurmMisConfig: SlurmMisConfigSchema,  cmd: string, parameters: string[], env: NodeJS.ProcessEnv, logger: Logger,
) => {

  const host = slurmMisConfig.managerUrl;

  return await sshConnect(host, "root", privateKeyPath, async (ssh) => {
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
};


export const executeSlurmScript = async (
  slurmMisConfig: SlurmMisConfigSchema, partitions: string[], params: string[], logger: Logger,
) => {

  const partitionsParam = partitions.map((x) => "\"" + x + "\"").join(" ");

  const result = await executeScript(slurmMisConfig, slurmMisConfig.scriptPath, params, {
    MYSQL_PASSWORD: slurmMisConfig.dbPassword,
    BASE_PARTITIONS: partitionsParam,
    ASSOC_TABLE: slurmMisConfig.associationTableName,
  }, logger);

  return result;
};

