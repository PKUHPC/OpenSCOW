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

import { spawnSync } from "child_process";
import { writeFileSync } from "fs";
import { dump } from "js-yaml";
import { InstallationConfigSchema } from "src/config/installation";
import { log as logger } from "src/log";

interface Props {
  configPyPath: string;
}

function executePython(pythonScript: string) {
  const rep = spawnSync("python3", ["-c", pythonScript], { encoding: "utf-8" });
  if (rep.error) { throw rep.error; }
  return rep.stdout;
}

type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;

export const migrateFromScowDeployment = (_options: Props) => {

  // 1. get config keys
  const keysOutput = executePython("import config, json; print(json.dumps(dir(config)))");
  const keys = (JSON.parse(keysOutput) as string[]).filter((x) => !x.startsWith("__"));

  function getSectionContent(key: string) {
    if (!keys.includes(key)) {
      return undefined;
    }
    return (JSON.parse(executePython(`import config, json; print(json.dumps(config.${key}))`)));
  }

  // 2. parse each section
  const common = getSectionContent("COMMON");
  const log = getSectionContent("LOG");
  const fluentd = getSectionContent("FLUENTD");
  const portal = getSectionContent("PORTAL");
  const mis = getSectionContent("MIS");
  const auth = getSectionContent("AUTH");
  const debug = getSectionContent("DEBUG");
  const gateway = getSectionContent("GATEWAY");

  const config: DeepPartial<InstallationConfigSchema> = {
    port: common.PORT,
    basePath: common.BASE_PATH,
    image: common.IMAGE,
    imageTag: common.IMAGE_TAG,

    gateway: gateway ? {
      uploadFileSizeLimit: gateway.UPLOAD_FILE_SIZE_LIMIT,
    } : undefined,

    portal: portal ? {
      basePath: portal.BASE_PATH,
      novncClientImage: portal.NOVNC_IMAGE,
      portMappings: {
        ...debug.OPEN_PORTS.PORTAL_SERVER ? { portalServer: debug.OPEN_PORTS.PORTAL_SERVER } : {},
      },
    } : undefined,

    mis: mis ? {
      basePath: mis.BASE_PATH,
      dbPassword: mis.DB_PASSWORD,
      portMappings: {
        ...debug.OPEN_PORTS.MIS_SERVER ? { misServer: debug.OPEN_PORTS.MIS_SERVER } : {},
        ...debug.OPEN_PORTS.DB ? { db: debug.OPEN_PORTS.DB } : {},
      },
    } : undefined,

    log: log ? {
      level: log.LEVEL,
      pretty: log.PRETTY,
      fluentd: fluentd ? {
        logDir: fluentd.LOG_DIR,
      } : undefined,
    } : undefined,

    auth: {
      portMappings: {
        ...debug.OPEN_PORTS.REDIS ? { redis: debug.OPEN_PORTS.REDIS } : {},
        ...debug.OPEN_PORTS.AUTH ? { auth: debug.OPEN_PORTS.AUTH } : {},
      },
      ...auth ? {
        custom: {
          image: auth.IMAGE,
          ports: auth.PORTS,
          volumes: auth.VOLUMES,
          environment: auth.ENV,
        },
      } : {},
    },
  };

  const data = dump(config);

  writeFileSync("installation.yaml", data);

  logger("installation.yaml is created based on config.py. Migration completed.");
};
