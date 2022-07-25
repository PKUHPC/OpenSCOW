import { AppConfigSchema } from "@scow/config/build/appConfig/app";
import type { ClusterConfigSchema } from "@scow/config/build/appConfig/cluster";
import type { PortalConfigSchema } from "@scow/config/build/appConfig/portal";
import type { UiConfigSchema } from "@scow/config/build/appConfig/ui";
import { CONFIG_BASE_PATH } from "@scow/config/build/constants";
import getConfig from "next/config";

export interface ServerRuntimeConfig {
  AUTH_EXTERNAL_URL: string;
  AUTH_INTERNAL_URL: string;

  SSH_PRIVATE_KEY_PATH: string;

  CLUSTERS_CONFIG: {[cluster: string]: ClusterConfigSchema};

  UI_CONFIG?: UiConfigSchema;

  PORTAL_CONFIG: PortalConfigSchema;

  DEFAULT_PRIMARY_COLOR: string;

  APPS: Record<string, AppConfigSchema>;

  MOCK_USER_ID: string | undefined;

  LOGIN_NODES: Record<string, string>;
}


export interface PublicRuntimeConfig {
  /** Cluster id and name */
  CLUSTER_NAMES: { [clusterId: string]: string };

  ENABLE_CHANGE_PASSWORD: boolean;

  ENABLE_SHELL: boolean;

  ENABLE_LOGIN_DESKTOP: boolean;
  LOGIN_DESKTOP_WMS: { name: string; wm: string }[];

  ENABLE_JOB_MANAGEMENT: boolean;

  ENABLE_APPS: boolean;

  MIS_PATH: string | undefined;

  DEFAULT_HOME_TEXT: string;
  HOME_TEXTS: {[hostname: string]: string };

  DEFAULT_HOME_TITLE: string;
  HOME_TITLES: {[hostname: string]: string };

  CLUSTERS_CONFIG: {[cluster: string]: ClusterConfigSchema};

  APPS: { id: string; name: string }[];

  SUBMIT_JOB_WORKING_DIR: string;

  PROXY_BASE_PATH: string;
}

export const runtimeConfig: ServerRuntimeConfig = getConfig().serverRuntimeConfig;
export const publicConfig: PublicRuntimeConfig = getConfig().publicRuntimeConfig;

export type Cluster = { id: string; name: string; }

export const CLUSTERS: Cluster[] = Object.entries(publicConfig.CLUSTER_NAMES).map(([id, name]) => ({ id, name }));

export const CLUSTERS_ID_MAP = CLUSTERS.reduce((prev, curr) => {
  prev[curr.id] = curr;
  return prev;
}, {} as Record<string, Cluster>);

export const CONFIG_PATH = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config";
