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
import { getLoginNode } from "@scow/config/build/cluster";
import { getSchedulerAdapterClient, SchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { testRootUserSshLogin } from "@scow/lib-ssh";
import { clusters } from "src/config/clusters";
import { rootKeyPair } from "src/config/env";
import { scowErrorMetadata } from "src/utils/error";

type CallOnAllResult<T> = {
  cluster: string;
  result: T
}[]

// Throw ServiceError if failed.
type CallOnAll = <T>(
  logger: Logger,
  call: (client: SchedulerAdapterClient) => Promise<T>,
) => Promise<CallOnAllResult<T>>;

type CallOnOne = <T>(
  cluster: string,
  logger: Logger,
  call: (client: SchedulerAdapterClient) => Promise<T>,
) => Promise<T>;

export type ClusterPlugin = {
  clusters: {
    callOnAll: CallOnAll;
    callOnOne: CallOnOne;
  }
}

export const CLUSTEROPS_ERROR_CODE = "CLUSTEROPS_ERROR";

export const clustersPlugin = plugin(async (f) => {

  if (process.env.NODE_ENV === "production") {
    await Promise.all(Object.values(clusters).map(async ({ displayName, loginNodes }) => {
      const loginNode = getLoginNode(loginNodes[0]);
      const address = loginNode.address;
      const node = loginNode.name;
      f.logger.info("Checking if root can login to %s by login node %s", displayName, node);
      const error = await testRootUserSshLogin(address, rootKeyPair, f.logger);
      if (error) {
        f.logger.info("Root cannot login to %s by login node %s. err: %o", displayName, node, error);
        throw error;
      } else {
        f.logger.info("Root can login to %s by login node %s", displayName, node);
      }
    }));
  }

  const adapterClientForClusters = Object.entries(clusters).reduce((prev, [cluster, c]) => {
    const client = getSchedulerAdapterClient(c.adapterUrl);

    prev[cluster] = client;

    return prev;
  }, {} as Record<string, SchedulerAdapterClient>);

  const getAdapterClient = (cluster: string) => {
    return adapterClientForClusters[cluster];
  };

  const clustersPlugin = {

    callOnOne: <CallOnOne>(async (cluster, logger, call) => {
      const client = getAdapterClient(cluster);

      if (!client) {
        throw new Error("Calling actions on non-existing cluster " + cluster);
      }

      logger.info("Calling actions on cluster " + cluster);
      return await call(client);
    }),

    // throws error if failed.
    callOnAll: <CallOnAll>(async (logger, call) => {

      const responses = await Promise.all(Object.entries(adapterClientForClusters)
        .map(async ([cluster, client]) => {
          return call(client).then((result) => {
            logger.info("Executing on %s success", cluster);
            return { cluster, success: true, result };
          }).catch((e) => {
            logger.error(e, "Executing on %s failed", cluster);
            return { cluster, success: false, error: e };
          });
        }));

      type SuccessResponse<T> = { cluster: string; success: boolean; result: T; };
      type ErrorResponse = { cluster: string; success: boolean; error: any; };

      function isSuccessResponse<T>(response: SuccessResponse<T> | ErrorResponse): response is SuccessResponse<T> {
        return response.success === true;
      }

      function isErrorResponse(response: SuccessResponse<any> | ErrorResponse): response is ErrorResponse {
        return response.success === false;
      }

      const results = responses.filter(isSuccessResponse).map(({ cluster, result }) => ({ cluster, result }));
      const failed = responses.filter(isErrorResponse).map(({ cluster, error }) => ({ cluster, error }));

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
