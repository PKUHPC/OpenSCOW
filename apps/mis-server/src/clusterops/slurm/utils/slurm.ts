import { Logger } from "@ddadaal/tsgrpc-server";
import { SlurmMisConfigSchema } from "@scow/config/build/appConfig/mis";
import { loggedExec, sshConnect } from "@scow/lib-ssh";
import { rootKeyPair } from "src/config/env";

export const executeScript = async (
  slurmMisConfig: SlurmMisConfigSchema,  cmd: string, parameters: string[], env: NodeJS.ProcessEnv, logger: Logger,
) => {

  const host = slurmMisConfig.managerUrl;

  return await sshConnect(host, "root", rootKeyPair, logger, async (ssh) => {
    return await loggedExec(ssh, logger, true, cmd, parameters, { execOptions: { env } });
  });
};


export const executeSlurmScript = async (
  slurmMisConfig: SlurmMisConfigSchema, partitions: string[], params: string[], logger: Logger,
) => {

  const partitionsParam = partitions.map((x) => "\"" + x + "\"").join(" ");

  const result = await executeScript(slurmMisConfig, slurmMisConfig.scriptPath, params, {
    MYSQL_PASSWORD: slurmMisConfig.dbPassword,
    BASE_PARTITIONS: partitionsParam,
    CLUSTER_NAME: slurmMisConfig.clusterName,
  }, logger);

  return result;
};

