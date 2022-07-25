import { getConfigFromFile } from "@scow/config";
import { MIS_CONFIG_NAME, MisConfigSchema } from "@scow/config/build/appConfig/mis";
import os from "os";
import path from "path";

export const misConfig = getConfigFromFile(MisConfigSchema, MIS_CONFIG_NAME);

export const privateKeyPath = misConfig.privateKeyPath ?? path.resolve(os.homedir(), ".ssh/id_rsa");
export const publicKeyPath = misConfig.publicKeyPath ?? path.resolve(os.homedir(), ".ssh/id_rsa.pub");
