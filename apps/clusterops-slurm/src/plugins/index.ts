import { SlurmPlugin, slurmPlugin } from "./slurm";

declare module "@ddadaal/tsgrpc-server" {
  interface Extensions extends SlurmPlugin {
  }
}

export const plugins = [
  slurmPlugin,
];
