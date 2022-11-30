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

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { InitServiceClient } from "src/generated/server/init";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { queryIfInitialized } from "src/utils/init";
import { handleGrpcClusteropsError } from "src/utils/internalError";
import { handlegRPCError } from "src/utils/server";

export interface CreateInitAdminSchema {
  method: "POST";

  body: {
    identityId: string;
    name: string;
    email: string;
    password: string;
  };

  responses: {
    204: null;
    400: { code: "USER_ID_NOT_VALID" };

    409: { code: "ALREADY_EXISTS_IN_AUTH" | "ALREADY_EXISTS_IN_SCOW" | "ALREADY_INITIALIZED" };

    500: { code: "UNKNOWN_ERROR" };

  }
}

const userIdRegex = publicConfig.USERID_PATTERN ? new RegExp(publicConfig.USERID_PATTERN) : undefined;

export default route<CreateInitAdminSchema>("CreateInitAdminSchema", async (req) => {
  const result = await queryIfInitialized();

  if (result) { return { 409: { code: "ALREADY_INITIALIZED" } }; }

  const { email, identityId, name, password } = req.body;

  if (userIdRegex && !userIdRegex.test(identityId)) {
    return { 400: {
      code: "USER_ID_NOT_VALID",
      message: `user id must match ${publicConfig.USERID_PATTERN}`,
    } };
  }

  const client = getClient(InitServiceClient);
  const exist = await asyncClientCall(client, "userExists", {
    userId: identityId,
  });
  if (exist.existsInScow) {
    return {
      409: { code: "ALREADY_EXISTS_IN_SCOW" } };
  }
  await asyncClientCall(client, "createInitAdmin", {
    email, name, userId: identityId, password, existsInAuth: exist.existsInAuth,
  })
    .catch(handlegRPCError({
      [Status.ALREADY_EXISTS]: () => ({ 409: "ALREADY_EXISTS_IN_AUTH" }),
      [Status.INTERNAL]: () => ({ 500: { code: "UNKNOWN_ERROR" } }),
      [Status.PERMISSION_DENIED]: handleGrpcClusteropsError,
    }));
  return { 204: null };
});

