import { AppConfigSchema } from "@scow/config/build/appConfig/app";
import type { ClusterConfigSchema } from "@scow/config/build/appConfig/cluster";
import type { PortalConfigSchema } from "@scow/config/build/appConfig/portal";
import type { UiConfigSchema } from "@scow/config/build/appConfig/ui";
import { CONFIG_BASE_PATH } from "@scow/config/build/constants";
import getConfig from "next/config";

export interface ServerRuntimeConfig {
  BASE_PATH: string;
  AUTH_INTERNAL_URL: string;

  APPS: { [id: string]: AppConfigSchema };

  CLUSTERS_CONFIG: {[cluster: string]: ClusterConfigSchema};

  UI_CONFIG?: UiConfigSchema;

  PORTAL_CONFIG: PortalConfigSchema;

  DEFAULT_PRIMARY_COLOR: string;

  MOCK_USER_ID: string | undefined;

  LOGIN_NODES: Record<string, string>;

  SERVER_URL: string;
}

export interface PublicClusterConfig {
  displayName: string;
  slurm: { partitions: string[] }
}


export interface PublicRuntimeConfig {
  ENABLE_CHANGE_PASSWORD: boolean;

  ENABLE_SHELL: boolean;

  ENABLE_LOGIN_DESKTOP: boolean;
  LOGIN_DESKTOP_WMS: { name: string; wm: string }[];

  ENABLE_JOB_MANAGEMENT: boolean;

  ENABLE_APPS: boolean;

  MIS_URL: string | undefined;

  DEFAULT_HOME_TEXT: string;
  HOME_TEXTS: {[hostname: string]: string };

  DEFAULT_HOME_TITLE: string;
  HOME_TITLES: {[hostname: string]: string };

  CLUSTERS_CONFIG: {[cluster: string]: PublicClusterConfig };

  CLUSTERS: Cluster[];

  APPS: { id: string; name: string }[];

  SUBMIT_JOB_WORKING_DIR: string;

  PROXY_BASE_PATH: string;
  RPROXY_BASE_PATH: string;
  WSPROXY_BASE_PATH: string;

}

export const runtimeConfig: ServerRuntimeConfig = getConfig().serverRuntimeConfig;
export const publicConfig: PublicRuntimeConfig = getConfig().publicRuntimeConfig;

export type Cluster = { id: string; name: string; }

export const CONFIG_PATH = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config";

export function clusterConfigToCluster(id: string): Cluster | undefined {
  const config = publicConfig.CLUSTERS_CONFIG[id];

  return config ? { id, name: config.displayName } : undefined;
}
