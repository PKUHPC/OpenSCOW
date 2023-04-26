/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { getAppConfigs } from "@scow/config/build/app";
import { getClusterConfigs } from "@scow/config/build/cluster";
import { getClusterTextsConfig } from "@scow/config/build/clusterTexts";
import { getMisConfig } from "@scow/config/build/mis";
import { getPortalConfig } from "@scow/config/build/portal";
import { getUiConfig } from "@scow/config/build/ui";
import { getInstallConfig } from "src/config/install";

interface Options {
  configPath: string;
  continueOnError: boolean;
  scowConfigPath: string;
}


export const checkConfig = ({
  configPath, continueOnError, scowConfigPath,
}: Options) => {

  const logger = console;

  const config = getInstallConfig(configPath);

  const tryRead = (readFn: (path: string, logger) => any) => {
    try {
      readFn(scowConfigPath, logger);
    } catch (e) {
      logger.error(e);
      if (!continueOnError) {
        process.exit(1);
      }
    }
  };

  logger.info("Checking cluster config files");
  tryRead(getClusterConfigs);

  logger.info("Checking cluster texts files");
  tryRead(getClusterTextsConfig);

  logger.info("Checking UI config");
  tryRead(getUiConfig);

  if (config.portal) {
    logger.info("Checking portal config");
    tryRead(getPortalConfig);

    logger.info("Checking app config");
    tryRead(getAppConfigs);
  } else {
    logger.info("Portal is not deployed. Skip portal config check.");
  }

  if (config.mis) {
    logger.info("Checking MIS configuration");
    tryRead(getMisConfig);
  } else {
    logger.info("MIS is not deployed. Skip MIS config check.");
  }
};
