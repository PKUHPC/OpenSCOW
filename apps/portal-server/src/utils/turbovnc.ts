import { NodeSSH } from "node-ssh";
import { join } from "path";
import { portalConfig } from "src/config/portal";
import { loggedExec } from "src/utils/ssh";
import { Logger } from "ts-log";

export const VNCSERVER_BIN_PATH = join(portalConfig.turboVNCPath, "bin", "vncserver");

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

export function parseOtp(stderr: string): string {
  const indicator = "Full control one-time password: ";
  for (const line of stderr.split("\n")) {
    if (line.startsWith(indicator)) {
      return line.substring(indicator.length).trim();
    }
  }

  throw new Error("Error parsing OTP");
}

export function parseDisplayId(stdout: string): number {

  // Desktop 'TurboVNC: t001:2 (2001213077)' started on display t001:2
  const regex = /^Desktop '.*' started on display .*:(\d+)$/;

  const lines = stdout.split("\n");

  for (const line of lines) {
    const matches = line.match(regex);
    if (!matches) { continue; }

    return +matches[1][0];
  }

  // logger.error("Error parsing display id from %s", stdout);
  throw new Error("Error parsing display id");
}

const vncPasswdPath = join(portalConfig.turboVNCPath, "bin", "vncpasswd");

export const refreshPassword = async (ssh: NodeSSH, logger: Logger, displayId: number) => {
  const resp = await loggedExec(ssh, logger, true,
    vncPasswdPath, ["-o", "-display", ":" + displayId]);

  return parseOtp(resp.stderr);
};

