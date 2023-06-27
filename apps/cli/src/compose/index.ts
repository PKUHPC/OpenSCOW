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

import { chmodSync, mkdirSync } from "fs";
import path from "path";
import { LoggingOption, ServiceSpec } from "src/compose/spec";
import { InstallConfigSchema } from "src/config/install";

function checkPathFormat(configKey: string, value: string) {
  if (value !== "/" && value.endsWith("/")) {
    throw new Error(`Invalid config: ${configKey} should not end with '/'`);
  }
}

function join(...segments: string[]) {
  const r = path.normalize(path.join(...segments));
  if (r !== "/" && r.endsWith("/")) {
    return r.substring(0, r.length - 1);
  }
  return r;
}

export const createComposeSpec = (config: InstallConfigSchema) => {
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
      environment: string[] | Record<string, string>,
      ports: string[] | Record<string, number>,
      volumes: string [] | Record<string, string>,
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

    function toStringArray(dict: Record<string, string | number>, splitter: string) {
      return Object.entries(dict).map(([from, to]) => `${from}${splitter}${to}`);
    }

    composeSpec.services[name] = {
      restart: "unless-stopped",
      environment: Array.isArray(options.environment) ? options.environment : toStringArray(options.environment, "="),
      ports: Array.isArray(options.ports) ? options.ports : toStringArray(options.ports, ":"),
      image: options.image,
      volumes: Array.isArray(options.volumes) ? options.volumes : toStringArray(options.volumes, ":"),
      depends_on: ((logging && name !== "log") ? ["log"] : []).concat(options.depends_on ?? []),
      logging,
    };
  };

  // fluentd
  if (config.log.fluentd) {
    // create log dir
    mkdirSync(config.log.fluentd.logDir, { recursive: true });
    // TODO may give fewer permissions
    chmodSync(config.log.fluentd.logDir, 0o777);

    addService("log", {
      image: config.log.fluentd.image,
      environment: {},
      ports: ["24224:24224", "24224:24224/udp"],
      volumes: {
        [config.log.fluentd.logDir]: "/fluentd/log",
        "./fluent/fluent.conf": "/fluentd/etc/fluent.conf",
      },
    });
  }

  const publicPath = "/__public__/";
  const publicDir = "/app/apps/gateway/public/";

  // GATEWAY
  addService("gateway", {
    image: scowImage,
    environment: {
      "SCOW_LAUNCH_APP": "gateway",
      "BASE_PATH": BASE_PATH == "/" ? "" : BASE_PATH,
      "PORTAL_PATH": PORTAL_PATH,
      "MIS_PATH": MIS_PATH,
      "CLIENT_MAX_BODY_SIZE": config.gateway.uploadFileSizeLimit,
      "PROXY_READ_TIMEOUT": config.gateway.proxyReadTimeout,
      "PUBLIC_PATH": publicPath,
      "PUBLIC_DIR": publicDir,
      "EXTRA": config.gateway.extra,
    },
    ports: { [config.port]: 80 },
    volumes: {
      "/etc/hosts": "/etc/hosts",
      "./public": publicDir,
    },
  });

  // AUTH

  addService("redis", {
    image: config.auth.redisImage,
    ports: config.auth.portMappings?.redis ? { [config.auth.portMappings?.redis]: 6379 } : {},
    environment: {},
    volumes: {},
  });

  const authVolumes = {
    "/etc/hosts": "/etc/hosts",
    "./config": "/etc/scow",
    "~/.ssh": "/root/.ssh",
  };

  if (config.auth.custom) {
    for (const key in config.auth.custom.volumes) {
      authVolumes[key] = config.auth.custom.volumes[key];
    }

    addService("auth", {
      image: config.auth.custom.image,
      ports: config.auth.custom.ports ?? {},
      environment: config.auth.custom.environment ?? {},
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
      ports: config.auth.portMappings?.auth ? { [config.auth.portMappings?.auth]: 5000 } : {},
      volumes: authVolumes,
    });
  }

  // PORTAL
  if (config.portal) {

    const portalBasePath = join(BASE_PATH, PORTAL_PATH);

    addService("portal-server", {
      image: scowImage,
      environment: {
        SCOW_LAUNCH_APP: "portal-server",
        PORTAL_BASE_PATH: portalBasePath,
        ...serviceLogEnv,
      },
      ports: config.portal.portMappings?.portalServer ? { [config.portal.portMappings.portalServer]: 5000 } : {},
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
        "BASE_PATH": portalBasePath,
        "MIS_URL": join(BASE_PATH, MIS_PATH),
        "MIS_DEPLOYED": config.mis ? "true" : "false",
        "AUTH_EXTERNAL_URL": join(BASE_PATH, "/auth"),
        "NOVNC_CLIENT_URL": join(BASE_PATH, "/vnc"),
        "CLIENT_MAX_BODY_SIZE": config.gateway.uploadFileSizeLimit,
        "PUBLIC_PATH": join(BASE_PATH, publicPath),
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
      ports: config.mis.portMappings?.misServer ? { [config.mis.portMappings.misServer]: 5000 } : {},
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
        "BASE_PATH": join(BASE_PATH, MIS_PATH),
        "PORTAL_URL": join(BASE_PATH, PORTAL_PATH),
        "PORTAL_DEPLOYED": config.portal ? "true" : "false",
        "AUTH_EXTERNAL_URL": join(BASE_PATH, "/auth"),
        "PUBLIC_PATH": join(BASE_PATH, publicPath),
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
      ports: config.mis.portMappings?.db ? { [config.mis.portMappings?.db]: 3306 } : {},
    });
  }

  return composeSpec;
};
