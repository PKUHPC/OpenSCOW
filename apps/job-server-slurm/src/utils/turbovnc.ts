import { Logger } from "@ddadaal/tsgrpc-server";
import { NodeSSH } from "node-ssh";
import { join } from "path";
import { config } from "src/config/env";
import { loggedExec } from "src/utils/ssh";

export const VNCSERVER_BIN_PATH = join(config.TURBOVNC_PATH, "bin", "vncserver");

export function parseListOutput(output: string): number[] {
  const ids = [] as number[];
  for (const line of output.split("\n")) {
    if (line.startsWith(":")) {
      const parts = line.split(" ");
      ids.push(parseInt(parts[0].substring(1)));
    }
  }

  return ids;
}

export function parseOtp(stderr: string, logger: Logger): string {
  const indicator = "Full control one-time password: ";
  for (const line of stderr.split("\n")) {
    if (line.startsWith(indicator)) {
      return line.substring(indicator.length).trim();
    }
  }

  logger.error("Error parsing OTP id from output %s", stderr);
  throw new Error("Error parsing OTP");
}

export function parseDisplayId(stdout: string, logger: Logger): number {

  // Desktop 'TurboVNC: t001:2 (2001213077)' started on display t001:2
  const regex = /^Desktop '.*' started on display .*:(\d+)$/;

  const lines = stdout.split("\n");

  for (const line of lines) {
    const matches = line.match(regex);
    if (!matches) { continue; }

    return +matches[1][0];
  }

  logger.error("Error parsing display id from %s", stdout);
  throw new Error("Error parsing display id");
}

const vncPasswdPath = join(config.TURBOVNC_PATH, "bin", "vncpasswd");

export const refreshPassword = async (ssh: NodeSSH, logger: Logger, displayId: number) => {
  const resp = await loggedExec(ssh, logger, true,
    vncPasswdPath, ["-o", "-display", ":" + displayId]);

  return parseOtp(resp.stderr, logger);
};

