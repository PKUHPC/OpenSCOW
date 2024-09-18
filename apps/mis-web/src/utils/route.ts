/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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

interface ClusterErrorMetadata {
  clusterId: string,
  details: string,
}

export const route: typeof typeboxRoute = (schema, handler) => {
  return typeboxRoute(schema, async (req, res) => {
    const response = handler(req, res);
    if (response instanceof Promise) {
      return response.catch((e) => {

        if (!(e.metadata instanceof Metadata)) { throw e; }

        const SCOW_ERROR = e.metadata.get("IS_SCOW_ERROR");
        if (!SCOW_ERROR) { throw e; }
        const code = e.metadata.get("SCOW_ERROR_CODE")?.[0]?.toString();
        const details = e.details;

        // 如果包含集群详细错误信息
        const clusterErrorsString = e.metadata.get("clusterErrors") ?? undefined;
        const clusterErrorsArray
         = clusterErrorsString && clusterErrorsString.length > 0 ?
           JSON.parse(clusterErrorsString) as ClusterErrorMetadata[] : undefined;

        // 如果包含当前在线集群的信息
        const currentActivatedClusterIdsStr = e.metadata.get("currentActivatedClusterIds") ?? undefined;
        const currentActivatedClusterIds
         = currentActivatedClusterIdsStr && currentActivatedClusterIdsStr.length > 0 ?
           JSON.parse(currentActivatedClusterIdsStr) as string[] : undefined;

        return { 500: { code, details, currentActivatedClusterIds, clusterErrorsArray } } as any;
      });
    }
  });
};
