import type { ClusterConfigSchema } from "@scow/config/build/appConfig/cluster";
import { CONFIG_BASE_PATH } from "@scow/config/build/constants";
import type { ClusterTexts } from "@scow/config/src/appConfig/clusterTexts";
import type { UiConfigSchema } from "@scow/config/src/appConfig/ui";
import getConfig from "next/config";

export interface ServerRuntimeConfig {
  SERVER_URL: string;
  AUTH_EXTERNAL_URL: string;
  AUTH_INTERNAL_URL: string;

  UI_CONFIG: UiConfigSchema | undefined;
  DEFAULT_PRIMARY_COLOR: string;

  CLUSTERS_CONFIG: {[clusterId: string]: ClusterConfigSchema};
  CLUSTER_TEXTS_CONFIG: ClusterTexts;
}

export interface PublicRuntimeConfig {
  /** Cluster id and name */
  CLUSTERS: { [clusterId: string]: string };
  PREDEFINED_CHARGING_TYPES: string[];
  ENABLE_CREATE_USER: boolean;
  ENABLE_CHANGE_PASSWORD: boolean;

  ACCOUNT_NAME_PATTERN: string | undefined;
  ACCOUNT_NAME_PATTERN_MESSAGE: string | undefined;

  PORTAL_PATH: string | undefined;
}

export const runtimeConfig: ServerRuntimeConfig = getConfig().serverRuntimeConfig;
export const publicConfig: PublicRuntimeConfig = getConfig().publicRuntimeConfig;

export type Cluster = { id: string; name: string; }

export const CLUSTERS: Cluster[] = Object.entries(publicConfig.CLUSTERS).map(([id, name]) => ({ id, name }));

export const CONFIG_PATH = process.env.NODE_ENV === "production" ? CONFIG_BASE_PATH : "config";
