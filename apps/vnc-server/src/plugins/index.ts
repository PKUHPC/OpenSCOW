import { SshPlugin, sshPlugin } from "./ssh";

declare module "@ddadaal/tsgrpc-server" {
  interface Extensions extends SshPlugin {
  }
}

export const plugins = [
  sshPlugin,
];
