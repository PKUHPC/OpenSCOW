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

import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { UserServiceServer, UserServiceService } from "@scow/scheduler-adapter-protos/build/user";
import { executeSlurmScript, handleSimpleResponse } from "src/utils/slurm";
export const userServiceServer = plugin((server) => {
  server.addService<UserServiceServer>(UserServiceService, {

    blockUserInAccount: async ({ request, logger }) => {
      const { accountName, userId } = request;
      const result = await executeSlurmScript(["-o", accountName, userId], logger);

      return [handleSimpleResponse(result, {
        4: <ServiceError>{
          code: Status.NOT_FOUND,
          message: `user ${userId} is not exist or not in account ${accountName}`,
        },
        7: <ServiceError>{
          code: Status.NOT_FOUND,
          message: `account ${accountName} is not exist`,
        },
      })];
    },

    unblockUserInAccount:async () => {
      return [{}];
    },

    removeUser:async () => {
      return [{}];
    },

    addUserToAccount:async () => {
      return [{}];
    },
  });
});
