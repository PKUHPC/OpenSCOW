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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { ConfigServiceServer, ConfigServiceService } from "@scow/protos/build/server/config";
import { parseErrorDetails } from "@scow/rich-error-model";

export const misConfigServiceServer = plugin((server) => {
  server.addService<ConfigServiceServer>(ConfigServiceService, {
    getAvailablePartitions: async ({ request, logger }) => {

      const { accountName, userId } = request;
      const reply = await server.ext.clusters.callOnAll(
        logger,
        async (client) => await asyncClientCall(client.config, "getAvailablePartitions", {
          accountName, userId,
        }).catch((e) => {
          const ex = e as ServiceError;
          const errors = parseErrorDetails(ex.metadata);
          if (errors[0] && errors[0].$type === "google.rpc.ErrorInfo"
          && errors[0].reason === "USER_ACCOUNT_NOT_FOUND") {
            throw <ServiceError> {
              code: Status.NOT_FOUND,
              message: "assocation not exist",
              details: e.details,
            };
          } else {
            throw e;
          }
        }),
      );

      const wrappedResult = reply.map((x) => {
        if (x.success) {
          return { cluster: x.cluster, partitions: x.result.partitions };
        }
      });
      return [{ clusterPartitions: wrappedResult } as any];
    },
  });
});
