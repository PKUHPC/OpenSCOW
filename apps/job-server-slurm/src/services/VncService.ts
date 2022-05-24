import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { clustersConfig } from "@scow/config/build/appConfig/clusters";
import { NodeSSH } from "node-ssh";
import path from "path";
import { checkClusterExistence } from "src/config/clusters";
import { config } from "src/config/env";
import { ListDesktopReply_Connection, VncServiceServer, VncServiceService } from "src/generated/portal/vnc";
import { loggedExec } from "src/plugins/ssh";
import { displayIdToPort } from "src/utils/port";


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

export function parseOtp(output: string, logger: Logger): string {
  const indicator = "Full control one-time password: ";
  for (const line of output.split("\n")) {
    if (line.startsWith(indicator)) {
      return line.substring(indicator.length).trim();
    }
  }

  logger.error("No otp from output %s", output);
  throw new Error("No otp from output");
}

export function parseDisplayId(output: string, logger: Logger): number {

  function fail(): never {
    logger.error("No display id from output %s", output);
    throw new Error("No display id from output");
  }

  const firstNonEmptyLine = output.split("\n").find((x) => x);
  if (!firstNonEmptyLine) { fail(); }

  const contents = firstNonEmptyLine.split(":");
  return +contents[contents.length-1];

}

const vncServerPath = path.join(config.TURBOVNC_PATH, "bin", "vncserver");
const vncPasswdPath = path.join(config.TURBOVNC_PATH, "bin", "vncpasswd");

export const vncServiceServer = plugin((server) => {

  async function asyncForEach<T>(array: T[], callback: (arg: T) => Promise<void>): Promise<void> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
  }

  const refreshPassword = async (ssh: NodeSSH, logger: Logger, displayId: number) => {
    const resp = await loggedExec(ssh, logger, true,
      vncPasswdPath, ["-o", "-display", ":" + displayId]);

    return parseOtp(resp.stderr, server.logger);
  };

  server.addService<VncServiceServer>(VncServiceService, {
    launchDesktop: async ({ request, logger }) => {
      const { cluster, username, displayId } = request;

      checkClusterExistence(cluster);
      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, username, logger, async (ssh, nodeAddr) => {

        // refresh the otp
        const password = await refreshPassword(ssh, logger, displayId);

        return [{ node: nodeAddr, port: displayIdToPort(displayId), password }];
      });
    },

    listDesktop: async ({ request, logger }) => {
      const { clusters, username } = request;

      const connectList: ListDesktopReply_Connection[] = [];

      await asyncForEach(clusters, async (x:string) => {

        checkClusterExistence(x);
        const node = clustersConfig[x].loginNodes[0];
        const clusterName = clustersConfig[x].displayName;
        const clusterId = x;

        await server.ext.connect(node, username, logger, async (ssh, nodeAddr) => {

          // list all running session
          const resp = await loggedExec(ssh, logger, true,
            vncServerPath, ["-list"],
          );

          const ids = parseListOutput(resp.stdout);
          connectList.push({
            node:nodeAddr,
            clusterName:clusterName,
            clusterId:clusterId,
            displayId:ids,
          });         
        });
      });
      return [{ connection:connectList }];
    },

    createDesktop: async ({ request, logger }) => {
      const { cluster , username } = request;

      checkClusterExistence(cluster);
      const node = clustersConfig[cluster].loginNodes[0];
      
      return await server.ext.connect(node, username, logger, async (ssh, nodeAddr) => {

        // find if the user has running session
        let resp = await loggedExec(ssh, logger, true,
          vncServerPath, ["-list"],
        );

        const ids = parseListOutput(resp.stdout);
        if (ids.length < config.MAX_DISPLAY) {
          // start a session
          resp = await loggedExec(ssh, logger, true,
            // explicitly set securitytypes to avoid requiring setting vnc passwd
            // TODO adds more desktop supprt other than xfce
            vncServerPath, ["-securitytypes", "OTP", "-otp", "-wm", "xfce"]);

          // parse the OTP from output. the output was in stderr
          const password = parseOtp(resp.stderr, server.logger);

          // parse display id from output
          const displayId = parseDisplayId(resp.stderr, server.logger);

          const port = displayIdToPort(displayId);

          return [{ node: nodeAddr, password, port }];
        } else {
          throw <ServiceError> {
            code: status.RESOURCE_EXHAUSTED,
            message: "VNC desktop has exceeded the maximum",
            details: `${config.MAX_DISPLAY}` ,
          };
        }
      });
    },

    killDesktop: async ({ request, logger }) => {
      const { cluster, username, displayId } = request;

      checkClusterExistence(cluster);
      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, username, logger, async (ssh, nodeAddr) => {
        
        //kill specific desktop
        await loggedExec(ssh, logger, true,
          vncServerPath, ["-kill", ":" + displayId]);

        return [ {} ];
      });

    },

    refreshOTPPassword: async ({ request, logger }) => {
      const { displayId, node, username } = request;

      return await server.ext.connect(node, username, logger, async (ssh) => {
        const password = await refreshPassword(ssh, logger, displayId);

        return [{ password }];
      });

    },
  });
});
