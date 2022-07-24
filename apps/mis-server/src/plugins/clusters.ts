import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { getClusterOps, opsForClusters } from "src/clusterops";
import { ClusterOps } from "src/clusterops/api";

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

export const clustersPlugin = plugin(async (f) => {

  const clustersPlugin = {

    callOnOne: <CallOnOne>(async (cluster, logger, call) => {
      const ops = getClusterOps(cluster);
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
          }).catch((e) =>{
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
        };
      }

    }),
  };

  f.addExtension("clusters", clustersPlugin);
});
