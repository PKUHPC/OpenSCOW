import { getConfigFromFile } from "@scow/config";
import { MIS_CONFIG_NAME, MisConfigSchema } from "@scow/config/build/appConfig/mis";

export const misConfig = getConfigFromFile(MisConfigSchema, MIS_CONFIG_NAME);

