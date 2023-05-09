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

import { asyncUnaryCall } from "@ddadaal/tsgrpc-client";
import { status } from "@grpc/grpc-js";
import { UserServiceClient } from "@scow/protos/build/server/user";
import { getClient } from "src/utils/client";
import { handlegRPCError } from "src/utils/server";

export type CheckNameMatchResult = "OK" | "NotMatch" | "NotFound";

export async function checkNameMatch(identityId: string, name: string): Promise<CheckNameMatchResult> {

  const client = getClient(UserServiceClient);

  return await asyncUnaryCall(client, "checkUserNameMatch", {
    name, userId: identityId,
  }).then(({ match }) => {
    return match ? "OK" : "NotMatch" as const;
  }).catch(handlegRPCError({
    [status.NOT_FOUND]: () => "NotFound" as const,
  }));

}
