import { getConfigFromFile } from "@scow/config";
import { UI_CONFIG_NAME, UiConfigSchema }  from "@scow/config/build/appConfig/ui";

export const uiConfig = getConfigFromFile(UiConfigSchema, UI_CONFIG_NAME, true);