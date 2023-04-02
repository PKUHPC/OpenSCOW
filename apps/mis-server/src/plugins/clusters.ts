/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { ServiceError } from "@ddadaal/tsgrpc-common";
import { Logger, plugin } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { testRootUserSshLogin } from "@scow/lib-ssh";
import { ClusterOps } from "src/clusterops/api";
import { createSlurmOps } from "src/clusterops/slurm";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { scowErrorMetadata } from "src/utils/error";

type CallOnAllResult<T> = ({ cluster: string; } & (
  | { success: true; result: T }
  | { success: false; error: any }
))[];

// Throw ServiceError if failed.
type CallOnAll = <T>(
  logger: Logger,
  call: (ops: ClusterOps) => Promise<T>,
) => Promise<CallOnAllResult<T>>;

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

export const CLUSTEROPS_ERROR_CODE = "CLUSTEROPS_ERROR";

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

  // client for clusters(if use adapter)
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
          return call(ops.ops).then((result) => {
            logger.info("Executing on %s success", cluster);
            return { cluster, success: true, result };
          }).catch((e) => {
            logger.error(e, "Executing on %s failed", cluster);
            return { cluster, success: false, error: e };
          });
        }));

      // errors if any fails
      const failed = results.filter((x) => !x.success);

      if (failed.length > 0) {
        logger.error("Cluster ops fails at clusters %o", failed);
        throw new ServiceError({
          code: status.INTERNAL,
          details: failed.map((x) => x.cluster).join(","),
          metadata: scowErrorMetadata(CLUSTEROPS_ERROR_CODE),
          // metadata: scowErrorMetadata(CLUSTEROPS_ERROR_CODE, {failedClusters: failed.join(",")})
        });
      }

      return results;

    }),
  };

  f.addExtension("clusters", clustersPlugin);
});
