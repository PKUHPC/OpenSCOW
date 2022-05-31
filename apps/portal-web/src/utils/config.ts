import { Clusters } from "@scow/config/build/appConfig/clusters";
import { CONFIG_BASE_PATH } from "@scow/config/build/constants";
import getConfig from "next/config";

export interface ServerRuntimeConfig {
  AUTH_EXTERNAL_URL: string;
  AUTH_INTERNAL_URL: string;

  JOB_SERVER: string;

  DEFAULT_FOOTER_TEXT: string;
  FOOTER_TEXTS: {[hostname: string]: string };

  DEFAULT_PRIMARY_COLOR: string;
  PRIMARY_COLORS: {[hostname: string]: string };

  SSH_PRIVATE_KEY_PATH: string;

  CLUSTERS_CONFIG: Clusters;
}


export interface PublicRuntimeConfig {
  /** Cluster id and name */
  CLUSTER_NAMES: { [clusterId: string]: string };

  ENABLE_CHANGE_PASSWORD: boolean;

  ENABLE_SHELL: boolean;

  /** cluster id */
  FILE_SERVERS: string[];

  ENABLE_LOGIN_DESKTOP: boolean;

  ENABLE_JOB_MANAGEMENT: boolean;

  ENABLE_APPS: boolean;

  MIS_PATH: string;

  DEFAULT_HOME_TEXT: string;
  HOME_TEXTS: {[hostname: string]: string };

  DEFAULT_HOME_TITLE: string;
  HOME_TITLES: {[hostname: string]: string };

  CLUSTERS_CONFIG: Clusters;

  APPS: { id: string; name: string }[];
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
