import { getConfigFromFile } from "@scow/config";
import { App, APP_CONFIG_BASE_PATH, AppConfigSchema } from "@scow/config/build/appConfig/app";
import { join } from "path";

const appConfigs = new Map<string, App>();

export const getAppConfig = (appId: string) => {
  let config = appConfigs.get(appId);

  if (!config) {
    config = getConfigFromFile(AppConfigSchema, join(APP_CONFIG_BASE_PATH, appId));
    appConfigs.set(appId, config);
  }

  return config;
};
