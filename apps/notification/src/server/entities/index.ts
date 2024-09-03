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

import { AdminMessageConfigSchema } from "src/server/entities/AdminMessageConfig";
import { ApiKeySchema } from "src/server/entities/ApiKey";
import { CustomMessageTypeSchema } from "src/server/entities/CustomMessageType";
import { MessageSchema } from "src/server/entities/Message";
import { MessageTargetSchema } from "src/server/entities/MessageTarget";
import { UserMessageReadSchema } from "src/server/entities/UserMessageRead";
import { UserSubscriptionSchema } from "src/server/entities/UserSubscription";

export const entities = [
  MessageSchema,
  AdminMessageConfigSchema,
  ApiKeySchema,
  MessageTargetSchema,
  CustomMessageTypeSchema,
  UserMessageReadSchema,
  UserSubscriptionSchema,
];
