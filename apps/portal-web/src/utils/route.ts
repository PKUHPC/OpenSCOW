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

import { typeboxRoute } from "@ddadaal/next-typed-api-routes-runtime";
import { Metadata } from "@grpc/grpc-js";

export interface ClusterErrorMetadata {
  clusterId: string,
  details: string,
}

export const route: typeof typeboxRoute = (schema, handler) => {
  return typeboxRoute(schema, async (req, res) => {
    const response = handler(req, res);
    if (response instanceof Promise) {
      return response.catch((e) => {
        if (!(e.metadata instanceof Metadata)) { throw e; }

        const SCOW_ERROR = (e.metadata as Metadata).get("IS_SCOW_ERROR");
        const SCOW_CAUSE = (e.metadata as Metadata).get("cause");
        if (SCOW_ERROR.length === 0) { throw e; }

        const code = e.metadata.get("SCOW_ERROR_CODE")[0].toString();
        const details = e.details;
        const message = SCOW_CAUSE[0];

        // 如果包含集群详细错误信息
        const clusterErrorsString = e.metadata.get("clusterErrors") ?? undefined;
        const clusterErrorsArray = JSON.parse(clusterErrorsString) as ClusterErrorMetadata[];

        return { 500: { code, details, message, clusterErrorsArray } } as any;
      });
    }
  });
};
