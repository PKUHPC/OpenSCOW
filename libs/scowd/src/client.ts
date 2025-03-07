import type { ServiceType } from "@bufbuild/protobuf";
import { type Client, createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-node";
import { AppService } from "@scow/scowd-protos/build/application/app_connect";
import { DesktopService } from "@scow/scowd-protos/build/application/desktop_connect";
import { ShellService } from "@scow/scowd-protos/build/application/shell_connect";
import { SystemService } from "@scow/scowd-protos/build/application/system_connect";
import { FileService } from "@scow/scowd-protos/build/storage/file_connect";

import { SslConfig } from "./ssl";

export interface ScowdClient {
  file: Client<typeof FileService>;
  desktop: Client<typeof DesktopService>;
  app: Client<typeof AppService>;
  system: Client<typeof SystemService>;
  shell: Client<typeof ShellService>;
}

export function getClient<TService extends ServiceType>(
  scowdUrl: string, service: TService, certificates?: SslConfig,
): Client<TService> {
  const transport = createConnectTransport({
    baseUrl: scowdUrl,
    httpVersion: "2",
    nodeOptions: {
      ...certificates,
    },
  });
  return createClient(service, transport);
}

export const getScowdClient = (scowdUrl: string, certificates?: SslConfig) => {
  return {
    file: getClient(scowdUrl, FileService, certificates),
    desktop: getClient(scowdUrl, DesktopService, certificates),
    app: getClient(scowdUrl, AppService, certificates),
    system: getClient(scowdUrl, SystemService, certificates),
    shell: getClient(scowdUrl, ShellService, certificates),
  } as ScowdClient;
};
