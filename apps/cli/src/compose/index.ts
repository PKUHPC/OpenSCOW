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

import path from "path";
import { LoggingOption, ServiceSpec } from "src/compose/spec";
import { InstallationConfigSchema } from "src/config/installation";

function checkPathFormat(configKey: string, value: string) {
  if (value !== "/" && value.endsWith("/")) {
    throw new Error(`Invalid config: ${configKey} should not end with '/'`);
  }
}

export const createComposeSpec = (config: InstallationConfigSchema) => {
  const scowImage = `${config.image}:${config.imageTag}`;

  const BASE_PATH = config.basePath;
  checkPathFormat("basePath", BASE_PATH);

  const PORTAL_PATH = config.portal?.basePath || "/";
  checkPathFormat("portal.basePath", PORTAL_PATH);

  const MIS_PATH = config.mis?.basePath || "/mis";
  checkPathFormat("mis.basePath", MIS_PATH);

  const serviceLogEnv = {
    LOG_LEVEL: config.log.level,
    LOG_PRETTY: String(config.log.pretty),
  };

  const composeSpec = {
    version: "3",
    services: {} as Record<string, ServiceSpec>,
    volumes: {} as Record<string, object>,
  };

  // service creation function
  const addService = (
    name: string,
    options: {
      image: string,
      environment: Record<string, string>,
      ports: Record<string, number>,
      volumes: Record<string, string>,
      depends_on?: string[],
    },
  ) => {

    const logging: LoggingOption | undefined = config.log.fluentd
      ? {
        driver: "fluentd",
        options: {
          "fluentd-address": "localhost:24224",
          "mode": "non-blocking",
          "tag": name,
        },
      } : undefined;

    composeSpec.services[name] = {
      restart: "unless-stopped",
      environment: Object.entries(options.environment).map(([key, val]) => `${key}=${val}`),
      ports: Object.entries(options.ports).map(([from, to]) => `${from}:${to}`),
      image: options.image,
      volumes: Object.entries(options.volumes).map(([from, to]) => `${from}:${to}`),
      depends_on: options.depends_on,
      logging,
    };
  };


  // GATEWAY
  addService("gateway", {
    image: scowImage,
    environment: {
      "SCOW_LAUNCH_APP": "gateway",
      "BASE_PATH": BASE_PATH == "/" ? "" : BASE_PATH,
      "PORTAL_PATH": PORTAL_PATH,
      "MIS_PATH": MIS_PATH,
    },
    ports: { [config.port]: 80 },
    volumes: { "/etc/hosts": "/etc/hosts" },
  });

  // AUTH

  addService("redis", {
    image: config.auth.redisImage,
    ports: config.debug.openPorts?.redis ? { [config.debug.openPorts.redis]: 6379 } : {},
    environment: {},
    volumes: {},
  });

  const authVolumes = {
    "/etc/hosts": "/etc/hosts",
    "./config": "/etc/scow",
    "~/.ssh": "/root/.ssh",
  };

  if (config.auth) {
    for (const key in config.auth.volumes) {
      authVolumes[key] = config.auth.volumes[key];
    }

    addService("auth", {
      image: config.auth.image,
      ports: config.auth.ports ?? {},
      environment: config.auth.env ?? {},
      volumes: authVolumes,
    });
  } else {
    addService("auth", {
      image: scowImage,
      environment: {
        "SCOW_LAUNCH_APP": "auth",
        "BASE_PATH": BASE_PATH,
        ...serviceLogEnv,
      },
      ports: config.debug.openPorts?.auth ? { [config.debug.openPorts.auth]: 5000 } : {},
      volumes: authVolumes,
    });
  }

  // PORTAL
  if (config.portal) {
    addService("portal-server", {
      image: scowImage,
      environment: {
        SCOW_LAUNCH_APP: "portal-server",
        ...serviceLogEnv,
      },
      ports: config.debug.openPorts?.portalServer ? { [config.debug.openPorts.portalServer]: 5000 } : {},
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh",
      },
    });

    addService("portal-web", {
      image: scowImage,
      environment: {
        "SCOW_LAUNCH_APP": "portal-web",
        "BASE_PATH": path.join(BASE_PATH, PORTAL_PATH),
        "MIS_URL": path.join(BASE_PATH, MIS_PATH),
        "MIS_DEPLOYED": config.mis ? "true" : "false",
        "AUTH_EXTERNAL_URL": path.join(BASE_PATH, "/auth"),
        "NOVNC_CLIENT_URL": path.join(BASE_PATH, "/vnc"),
      },
      ports: {},
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
      },
    });

    addService("novnc", {
      image: config.portal.novncClientImage,
      environment: {},
      ports: {},
      volumes: {},
    });
  }

  // MIS
  if (config.mis) {
    addService("mis-server", {
      image: scowImage,
      ports: config.debug.openPorts?.misServer ? { [config.debug.openPorts.misServer]: 5000 } : {},
      environment: {
        "SCOW_LAUNCH_APP": "mis-server",
        "DB_PASSWORD": config.mis.dbPassword,
        ...serviceLogEnv,
      },
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh",
      },
    });


    addService("mis-web", {
      image: scowImage,
      environment: {
        "SCOW_LAUNCH_APP": "mis-web",
        "BASE_PATH": path.join(BASE_PATH, MIS_PATH),
        "PORTAL_URL": path.join(BASE_PATH, PORTAL_PATH),
        "PORTAL_DEPLOYED": config.portal ? "true" : "false",
        "AUTH_EXTERNAL_URL": path.join(BASE_PATH, "/auth"),
      },
      ports: {},
      volumes: {
        "./config": "/etc/scow",
      },
    });

    composeSpec.volumes["db_data"] = {};

    addService("db", {
      image: config.mis.mysqlImage,
      volumes: {
        "db_data": "/var/lib/mysql",
      },
      environment: {
        "MYSQL_ROOT_PASSWORD": config.mis.dbPassword,
      },
      ports: config.debug.openPorts?.db ? { [config.debug.openPorts.db]: 3306 } : {},
    });
  }

  return composeSpec;
};
