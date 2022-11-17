import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { testRootUserSshLogin } from "@scow/lib-ssh";
import { ClusterOps } from "src/clusterops/api";
import { createSlurmOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";

// Throw ServiceError if failed.
type CallOnAll = <T>(
  logger: Logger,
  call: (ops: ClusterOps) => Promise<T>,
) => Promise<void>;

type CallOnOne = <T>(
  cluster: string,
  logger: Logger,
  call: (ops: ClusterOps) => Promise<T>,
) => Promise<T>;

export type ClusterPlugin = {
  clusters: {
    callOnAll: CallOnAll;
    callOnOne: CallOnOne;
  }
}

const clusterOpsMaps = {
  "slurm": createSlurmOps,
} as const;

export const clustersPlugin = plugin(async (f) => {

  if (process.env.NODE_ENV === "production") {
    await Promise.all(Object.values(clusters).map(async ({ displayName, slurm: { loginNodes } }) => {
      const node = loginNodes[0];
      f.logger.info("Checking if root can login to %s by login node %s", displayName, node);
      const error = await testRootUserSshLogin(node, rootKeyPair, f.logger);
      if (error) {
        f.logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node, error);
        throw error;
      } else {
        f.logger.info("Root can login to %s by login node %s", displayName, node);
      }
    }));
  }

  const opsForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
    const ops = clusterOpsMaps[(c.scheduler as keyof typeof clusterOpsMaps)](cluster, f.logger);

    if (ops) {
      prev[cluster] = { ops, ignore: c.misIgnore };
    }

    return prev;
  }, {} as Record<string, { ops: ClusterOps, ignore: boolean } >);

  for (const ops of Object.values(opsForClusters).filter((x) => !x.ignore).map((x) => x.ops)) {
    await ops.onStartup();
  }

  const getClusterOps = (cluster: string) => {
    return opsForClusters[cluster];
  };

  const clustersPlugin = {

    callOnOne: <CallOnOne>(async (cluster, logger, call) => {
      const ops = getClusterOps(cluster);

      if (!ops) {
        throw new Error("Calling actions on non-existing cluster " + cluster);
      }

      if (ops.ignore) {
        throw new Error("Call specific actions on ignored cluster " + cluster);
      }
      return await call(ops.ops);
    }),

    // throws error if failed.
    callOnAll: <CallOnAll>(async (logger, call) => {

      const results = await Promise.all(Object.entries(opsForClusters)
        .filter(([_, c]) => !c.ignore)
        .map(async ([cluster, ops]) => {
          return call(ops.ops).then(() => {
            logger.info("Executing on %s success", cluster);
            return;
          }).catch((e) => {
            logger.info("Executing on %s failed for %o", cluster, e);
            return cluster;
          });
        }));

      // errors if any fails
      const failed = results.filter((x) => x) as string[];

      if (failed.length > 0) {
        logger.error("Cluster ops fails at clusters %o", failed);
        throw <ServiceError>{
          code: Status.INTERNAL,
          message: "Execution on clusters failed.",
          details: failed.map((x) => clusters[x].displayName).join(","),
        };
      }

    }),
  };

  f.addExtension("clusters", clustersPlugin);
});
