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

import { ConnectRouter } from "@connectrpc/connect";
import adminMessageConfigRouter from "src/server/connectrpc/route/admin-message-config";
import apiKeyRouter from "src/server/connectrpc/route/api-key";
import configRouter from "src/server/connectrpc/route/config";
import messageRouter from "src/server/connectrpc/route/message";
import messageTypeRouter from "src/server/connectrpc/route/message-type";
import noticeTypeRouter from "src/server/connectrpc/route/notice-type";
import scowMessageRouter from "src/server/connectrpc/route/scow-message";
import UserRouter from "src/server/connectrpc/route/user";
import userSubscriptionRouter from "src/server/connectrpc/route/user-subscription";

export default (router: ConnectRouter) => {
  apiKeyRouter(router);
  adminMessageConfigRouter(router);
  userSubscriptionRouter(router);
  messageTypeRouter(router);
  messageRouter(router);
  noticeTypeRouter(router);
  configRouter(router);
  UserRouter(router);
  scowMessageRouter(router);
};

