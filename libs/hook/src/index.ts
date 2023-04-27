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
import { ChannelCredentials } from "@grpc/grpc-js";
import { ScowHookConfigSchema } from "@scow/config/build/common";
import { HookServiceClient, OnEventRequest } from "@scow/protos/build/hook/hook";
import { Logger } from "ts-log";

type Event = Exclude<OnEventRequest["event"], undefined>;

export const createHookClient = (config: ScowHookConfigSchema | undefined) => {
  const client = (config && config.enabled)
    ? new HookServiceClient(config.url, ChannelCredentials.createInsecure())
    : undefined;

  return {
    callHook: async <TEventName extends Event["$case"]>(
      eventName: TEventName,
      // @ts-ignore
      eventPayload: (Event & { $case: TEventName })[TEventName],
      logger: Logger,
    ) => {

      if (!client) {
        return;
      }

      logger.info("Calling hook %o", event);

      return await asyncUnaryCall(client, "onEvent", {
        metadata: { time: new Date().toISOString() },
        // @ts-ignore
        event: { $case: eventName, [eventName]: eventPayload },
      }).catch((e) => {
        logger.error(e, "Error when calling hook");
      });
    },
  };
};


