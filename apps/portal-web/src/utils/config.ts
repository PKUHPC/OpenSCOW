import getConfig from "next/config";
import { join } from "path";

export const VNC_SERVER_URL = join(process.env.NEXT_PUBLIC_BASE_PATH || "", "vnc-server:5000");
export const SHELL_SERVER_URL = join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/shell-server/socket.io");

export interface ServerRuntimeConfig {
  AUTH_EXTERNAL_URL: string;
  AUTH_INTERNAL_URL: string;

  DEFAULT_FOOTER_TEXT: string;
  FOOTER_TEXTS: {[hostname: string]: string };

  DEFAULT_PRIMARY_COLOR: string;
  PRIMARY_COLORS: {[hostname: string]: string };
}


export interface PublicRuntimeConfig {
  /** Cluster id and name */
  CLUSTER_NAMES: { [clusterId: string]: string };

  ENABLE_CHANGE_PASSWORD: boolean;

  ENABLE_SHELL: boolean;

  /** cluster id */
  FILE_SERVERS: string[];

  ENABLE_VNC: boolean;

  MIS_PATH: string;
}

export const runtimeConfig: ServerRuntimeConfig = getConfig().serverRuntimeConfig;
export const publicConfig: PublicRuntimeConfig = getConfig().publicRuntimeConfig;

export type Cluster = { id: string; name: string; }

export const CLUSTERS: Cluster[] = Object.entries(publicConfig.CLUSTER_NAMES).map(([id, name]) => ({ id, name }));
