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
import { AuthCustomType, InstallConfigSchema } from "src/config/install";
import { logger } from "src/log";

const IMAGE: string = "mirrors.pku.edu.cn/pkuhpc-icode/scow";

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
  // 如果install.yaml没有配置image则使用默认image
  const scowImage = `${config.image || IMAGE}:${config.imageTag}`;

  const BASE_PATH = config.basePath;
  checkPathFormat("basePath", BASE_PATH);

  const PORTAL_PATH = config.portal?.basePath || "/";
  checkPathFormat("portal.basePath", PORTAL_PATH);

  const MIS_PATH = config.mis?.basePath || "/mis";
  checkPathFormat("mis.basePath", MIS_PATH);

  const AI_PATH = config.ai?.basePath || "/ai";
  checkPathFormat("ai.basePath", AI_PATH);

  const serviceLogEnv = {
    LOG_LEVEL: config.log.level,
    LOG_PRETTY: String(config.log.pretty),
  };

  const composeSpec = {
    version: "3",
    services: {} as Record<string, ServiceSpec>,
    volumes: {} as Record<string, object>,
  };

  const nodeOptions = config.misc?.nodeOptions;

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

  const defaultServerBlock = `server {
    listen 80 default_server;
    return 444;
  }`;
  // GATEWAY
  addService("gateway", {
    image: scowImage,
    environment: {
      "SCOW_LAUNCH_APP": "gateway",
      "BASE_PATH": BASE_PATH == "/" ? "" : BASE_PATH,
      "PORTAL_PATH": PORTAL_PATH,
      "MIS_PATH": MIS_PATH,
      "AI_PATH": AI_PATH,
      "CLIENT_MAX_BODY_SIZE": config.gateway.uploadFileSizeLimit,
      "PROXY_READ_TIMEOUT": config.gateway.proxyReadTimeout,
      "PUBLIC_PATH": publicPath,
      "PUBLIC_DIR": publicDir,
      "EXTRA": config.gateway.extra,
      "ALLOWED_SERVER_NAME": config.gateway.allowedServerName,
      "DEFAULT_SERVER_BLOCK": config.gateway.allowedServerName === "_" ? "" : defaultServerBlock,
      ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
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

  const authUrl = config.auth.custom?.type === AuthCustomType.external
    ? config.auth.custom.external?.url : "http://auth:5000";

  // 是否配置自定义认证系统
  if (config.auth.custom) {
    // 未配置 type，则为旧版本自定义认证系统配置
    if (config.auth.custom.type === undefined) {
      if (config.auth.custom.image === undefined) {
        throw new Error("Invalid config: auth/custom/image is required");
      }

      for (const key in config.auth.custom.volumes) {
        authVolumes[key] = config.auth.custom.volumes[key];
      }

      if (typeof config.auth.custom.image === "object" && config.auth.custom.image !== null) {
        throw new Error("Invalid config: " +
          "auth/custom/image in the old version of the custom authentication system configuration is a string");
      }

      logger.info("The current configuration of the custom authentication system is outdated, "
        + "please read the relevant configuration documentation and update it.");

      addService("auth", {
        image: config.auth.custom.image,
        ports: config.auth.custom.ports ?? {},
        environment: config.auth.custom.environment ?? {},
        volumes: authVolumes,
      });
    } else { // 新版自定义认证系统配置

      // 镜像类型的自定义认证系统
      if (config.auth.custom.type === AuthCustomType.image) {
        if (config.auth.custom.image === undefined) {
          throw new Error("Invalid config: auth/custom/image is required");
        }

        if (typeof config.auth.custom.image === "string") {
          throw new Error("Invalid config: auth/custom/image is an object, but it is passed as a string");
        }
        const image = config.auth.custom.image.imageName;

        for (const key in config.auth.custom.image.volumes) {
          authVolumes[key] = config.auth.custom.image.volumes[key];
        }

        addService("auth", {
          image,
          ports: config.auth.custom.image.ports ?? {},
          environment: config.auth.custom.environment ?? {},
          volumes: authVolumes,
        });
      } else if (config.auth.custom.type === AuthCustomType.external) {
        if (authUrl === undefined) {
          throw new Error("Invalid config: when /auth/custom/type is external, /auth/custom/external/url is required");
        }
      }
    }
  } else {
    const portalBasePath = join(BASE_PATH, PORTAL_PATH);

    addService("auth", {
      image: scowImage,
      environment: {
        "SCOW_LAUNCH_APP": "auth",
        "BASE_PATH": BASE_PATH,
        "PORTAL_BASE_PATH": portalBasePath,
        ...serviceLogEnv,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
      },
      ports: config.auth.portMappings?.auth ? { [config.auth.portMappings?.auth]: 5000 } : {},
      volumes: authVolumes,
    });
  }

  // PORTAL
  if (config.portal) {

    const portalBasePath = join(BASE_PATH, PORTAL_PATH);

    composeSpec.volumes["portal_data"] = {};

    addService("portal-server", {
      image: scowImage,
      environment: {
        SCOW_LAUNCH_APP: "portal-server",
        PORTAL_BASE_PATH: portalBasePath,
        ...serviceLogEnv,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
      },
      ports: config.portal.portMappings?.portalServer ? { [config.portal.portMappings.portalServer]: 5000 } : {},
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh",
        "portal_data":"/var/lib/scow/portal",
      },
    });

    addService("portal-web", {
      image: scowImage,
      environment: {
        "SCOW_LAUNCH_APP": "portal-web",
        "BASE_PATH": portalBasePath,
        "MIS_URL": join(BASE_PATH, MIS_PATH),
        "MIS_DEPLOYED": config.mis ? "true" : "false",
        "AI_URL": join(BASE_PATH, AI_PATH),
        "AI_DEPLOYED": config.ai ? "true" : "false",
        "AUTH_EXTERNAL_URL": config.auth.custom?.external?.url || join(BASE_PATH, "/auth"),
        "AUTH_INTERNAL_URL": authUrl || "http://auth:5000",
        "NOVNC_CLIENT_URL": join(BASE_PATH, "/vnc"),
        "CLIENT_MAX_BODY_SIZE": config.gateway.uploadFileSizeLimit,
        "PUBLIC_PATH": join(BASE_PATH, publicPath),
        "AUDIT_DEPLOYED": config.audit ? "true" : "false",
        "PROTOCOL": config.gateway.protocol,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
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
        AUTH_URL: config.auth.custom?.external?.url ?? "",
        ...serviceLogEnv,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
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
        "AI_URL": join(BASE_PATH, AI_PATH),
        "AI_DEPLOYED": config.ai ? "true" : "false",
        "AUTH_EXTERNAL_URL": config.auth.custom?.external?.url || join(BASE_PATH, "/auth"),
        "AUTH_INTERNAL_URL": authUrl || "http://auth:5000",
        "PUBLIC_PATH": join(BASE_PATH, publicPath),
        "AUDIT_DEPLOYED": config.audit ? "true" : "false",
        "PROTOCOL": config.gateway.protocol,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
      },
      ports: {},
      volumes: {
        "/etc/hosts": "/etc/hosts",
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

  // AUDIT
  if (config.audit) {
    addService("audit-server", {
      image: scowImage,
      ports: config.audit.portMappings?.auditServer
        ? { [config.audit.portMappings.auditServer]: 5000 }
        : {},
      environment: {
        "SCOW_LAUNCH_APP": "audit-server",
        "DB_PASSWORD": config.audit.dbPassword,
        ...serviceLogEnv,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
      },
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
      },
    });

    composeSpec.volumes["audit_db_data"] = {};

    addService("audit-db", {
      image: config.audit.mysqlImage,
      volumes: {
        "audit_db_data": "/var/lib/mysql",
      },
      environment: {
        "MYSQL_ROOT_PASSWORD": config.audit.dbPassword,
      },
      ports: config.audit.portMappings?.db ? { [config.audit.portMappings?.db]: 3306 } : {},
    });
  }

  if (config.ai) {
    addService("ai", {
      image: scowImage,
      ports: {},
      environment: {
        "SCOW_LAUNCH_APP": "ai",
        "NEXT_PUBLIC_BASE_PATH": join(BASE_PATH, AI_PATH),
        "MIS_URL": join(BASE_PATH, MIS_PATH),
        "MIS_DEPLOYED": config.mis ? "true" : "false",
        "DB_PASSWORD": config.ai.dbPassword,
        "PORTAL_URL": join(BASE_PATH, PORTAL_PATH),
        "PORTAL_DEPLOYED": config.portal ? "true" : "false",
        "AUTH_EXTERNAL_URL": config.auth.custom?.external?.url || join(BASE_PATH, "/auth"),
        "AUTH_INTERNAL_URL": authUrl || "http://auth:5000",
        "PUBLIC_PATH": join(BASE_PATH, publicPath),
        "AUDIT_DEPLOYED": config.audit ? "true" : "false",
        "CLIENT_MAX_BODY_SIZE": config.gateway.uploadFileSizeLimit,
        "PROTOCOL": config.gateway.protocol,
        ...serviceLogEnv,
        ...nodeOptions ? { NODE_OPTIONS: nodeOptions } : {},
      },
      volumes: {
        "/etc/hosts": "/etc/hosts",
        "./config": "/etc/scow",
        "~/.ssh": "/root/.ssh",
      },
    });

    composeSpec.volumes["ai_db_data"] = {};

    addService("ai-db", {
      image: config.ai.mysqlImage,
      volumes: {
        "ai_db_data": "/var/lib/mysql",
      },
      environment: {
        "MYSQL_ROOT_PASSWORD": config.ai.dbPassword,
      },
      ports: config.ai.portMappings?.db ? { [config.ai.portMappings?.db]: 3306 } : {},
    });
  }

  return composeSpec;
};
