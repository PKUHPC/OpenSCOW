import { Logger } from "@ddadaal/tsgrpc-server";
import { NodeSSH } from "node-ssh";
import { join } from "path";
import { config } from "src/config/env";
import { loggedExec } from "src/plugins/ssh";


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

  const firstNonEmptyLine = stdout.split("\n").find((x) => x);
  if (!firstNonEmptyLine) {
    logger.error("Error parsing display id from output %s", stdout);
    throw new Error("Error parsing display id");
  }

  const contents = firstNonEmptyLine.split(":");
  return +contents[contents.length - 1];

}

const vncPasswdPath = join(config.TURBOVNC_PATH, "bin", "vncpasswd");

export const refreshPassword = async (ssh: NodeSSH, logger: Logger, displayId: number) => {
  const resp = await loggedExec(ssh, logger, true,
    vncPasswdPath, ["-o", "-display", ":" + displayId]);

  return parseOtp(resp.stderr, logger);
};

