import type { ClusterConfigSchema } from "@scow/config/build/cluster";
import type { ClusterTextsConfigSchema } from "@scow/config/build/clusterTexts";
import type { UiConfigSchema } from "@scow/config/build/ui";
import getConfig from "next/config";

export interface ServerRuntimeConfig {
  SERVER_URL: string;
  BASE_PATH: string;
  AUTH_INTERNAL_URL: string;

  UI_CONFIG: UiConfigSchema | undefined;
  DEFAULT_PRIMARY_COLOR: string;

  CLUSTERS_CONFIG: {[clusterId: string]: ClusterConfigSchema};
  CLUSTER_TEXTS_CONFIG: ClusterTextsConfigSchema;
}

export interface PublicRuntimeConfig {
  CLUSTERS: { [clusterId: string]: Cluster };
  PREDEFINED_CHARGING_TYPES: string[];
  ENABLE_CREATE_USER: boolean;
  ENABLE_CHANGE_PASSWORD: boolean;

  ACCOUNT_NAME_PATTERN: string | undefined;
  ACCOUNT_NAME_PATTERN_MESSAGE: string | undefined;

  USERID_PATTERN: string | undefined;
  USERID_PATTERN_MESSAGE: string | undefined;

  PORTAL_URL: string | undefined;
}

export const runtimeConfig: ServerRuntimeConfig = getConfig().serverRuntimeConfig;
export const publicConfig: PublicRuntimeConfig = getConfig().publicRuntimeConfig;

export type Cluster = { id: string; name: string; }

