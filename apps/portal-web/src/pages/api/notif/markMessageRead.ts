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

import { typeboxRouteSchema } from "@ddadaal/next-typed-api-routes-runtime";
import { getNotificationNodeClient } from "@scow/lib-notification/build/client";
import { OperationType } from "@scow/lib-operation-log";
import { Type } from "@sinclair/typebox";
import { authenticate } from "src/auth/server";
import { OperationResult } from "src/models/operationLog";
import { callLog } from "src/server/operationLog";
import { publicConfig } from "src/utils/config";
import { route } from "src/utils/route";
import { parseIp } from "src/utils/server";

export const MarkMessageReadSchema = typeboxRouteSchema({
  method: "POST",

  body: Type.Object({
    messageId: Type.Number(),
  }),

  responses: {
    204: Type.Null(),
    500: Type.Object({ code: Type.Literal("MARK_MESSAGE_READ_ERROR") }),
  },
});

const auth = authenticate(() => true);

export default /* #__PURE__*/route(MarkMessageReadSchema, async (req, res) => {

  const info = await auth(req, res);

  if (!info) { return; }

  const { messageId } = req.body;

  const notifClient = publicConfig.NOTIF_ENABLED && publicConfig.NOTIF_ADDRESS
    ? getNotificationNodeClient(publicConfig.NOTIF_ADDRESS) : undefined;

  if (!notifClient) {
    return;
  }

  const logInfo = {
    operatorUserId: info.identityId,
    operatorIp: parseIp(req) ?? "",
    operationTypeName: OperationType.markMessageRead,
    operationTypePayload:{ messageId: messageId },
  };

  return notifClient.message.markMessageRead({ userId: info.identityId, messageId: BigInt(messageId) })
    .then(async () => {
      await callLog(logInfo, OperationResult.SUCCESS);
      return { 204: null };
    }).catch(() => {
      return { 500: { code: "MARK_MESSAGE_READ_ERROR" as const } };
    });
});
