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

import { route as rawRoute } from "@ddadaal/next-typed-api-routes-runtime";
import { Metadata } from "@grpc/grpc-js";

export const route: typeof rawRoute = (schemaName, handler) => {
  return rawRoute(schemaName, async (req, res) => {
    const response = handler(req, res);
    if (response instanceof Promise) {
      return response.catch((e) => {
        if (!(e.metadata instanceof Metadata)) { throw e; }

        const SCOW_ERROR = e.metadata.get("IS_SCOW_ERROR");
        if (!SCOW_ERROR) { throw e; }
        const code = e.metadata.get("SCOW_ERROR_CODE")[0].toString();
        const details = e.details;
        return { 500: { code, details } };
      });
    }
  });
};