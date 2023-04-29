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
import { Plugin } from "@ddadaal/tsgrpc-server";
import { status } from "@grpc/grpc-js";
import { ScowApiConfigSchema } from "@scow/config/build/common";

export const apiAuthPlugin = (config: ScowApiConfigSchema): Plugin => async (s) => {

  if (config.auth?.token) {

    const token = config.auth.token;

    s.addRequestHook(async (call) => {

      const authorizationHeaders = call.metadata.get("authorization");

      if (authorizationHeaders.length === 0) {
        throw new ServiceError({
          code: status.UNAUTHENTICATED,
          message: "SCOW API must be called with proper authentication",
        });
      }

      if (authorizationHeaders.length === 2) {
        throw new ServiceError({
          code: status.INVALID_ARGUMENT,
          message: "Multiple authorization headers received",
        });
      }

      if (authorizationHeaders[0] !== `Bearer ${token}`) {
        throw new ServiceError({
          code: status.UNAUTHENTICATED,
          message: "Token is invalid",
        });
      }
    });
  }
};
