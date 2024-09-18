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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { SchedulerAdapterClient } from "@scow/lib-scheduler-adapter";
import { DetailedError, ErrorInfo } from "@scow/rich-error-model";
import { ApiVersion } from "@scow/utils/build/version";
import { Logger } from "ts-log";

import { compareSchedulerApiVersion, getSchedulerApiVersion } from "./scheduleAdapter";

export const errorInfo = (reason: string) =>
  ErrorInfo.create({ domain: "", reason: reason, metadata: {} });

/**
 * HPC提交作业前检查作业名和应用名是否重复
 * @param client
 * @param userId
 * @param jobName
 * @param logger
 */
export const checkJobNameExisting = async (client: SchedulerAdapterClient,userId: string,jobName: string,
  logger: Logger) => {
  // 检查作业重名的最低调度器接口版本
  const minRequiredApiVersion: ApiVersion = { major: 1, minor: 6, patch: 0 };

  const scheduleApiVersion = await getSchedulerApiVersion(client, logger);

  if (compareSchedulerApiVersion(scheduleApiVersion,minRequiredApiVersion)) {
    const existingJobName = await asyncClientCall(client.job, "getJobs", {
      fields: ["job_id"],
      filter: {
        users: [userId], accounts: [], states: [], jobName,
      },
    }).then((resp) => resp.jobs);

    if (existingJobName.length) {

      throw new DetailedError({
        code: Status.ALREADY_EXISTS,
        message: `jobName ${jobName} is already existed`,
        details: [errorInfo("ALREADY_EXISTS")],
      });
    }
  } else {
    logger.info("Adapter version lower than 1.6.0, do not perform check for duplicate job names");
  }

};
