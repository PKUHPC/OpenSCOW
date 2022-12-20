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

import { loggedExec } from "@scow/lib-ssh";
import { RunningJob } from "@scow/protos/build/common/job";
import { NodeSSH } from "node-ssh";
import { JobInfo } from "src/clusterops/api/job";
import dayjs, { Dayjs } from "src/utils/dayjs";
import { Logger } from "ts-log";

const SEPARATOR = "__x__x__";

export async function querySqueue(ssh: NodeSSH, logger: Logger, params: string[]) {
  const result = await loggedExec(ssh, logger, true,
    "squeue",
    [
      "-o",
      ["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l", "%Z"].join(SEPARATOR),
      "--noheader",
      ...params,
    ],
  );

  const jobs = result.stdout.split("\n").filter((x) => x).map((x) => {
    const [
      jobId,
      partition, name, user, state, runningTime,
      nodes, nodesOrReason, account, cores,
      qos, submissionTime, nodesToBeUsed, timeLimit, workingDir,
    ] = x.split(SEPARATOR);

    return {
      jobId,
      partition, name, user, state, runningTime,
      nodes, nodesOrReason, account, cores,
      qos, submissionTime, nodesToBeUsed, timeLimit,
      workingDir,
    } as RunningJob;
  });

  return jobs;
}

function applyOffset(time: Dayjs, tz: string): Dayjs {
  // tz is of format +08:00

  const [h, m] = tz.substring(1).split(":");

  const sign = tz[0];
  if (sign === "+") {
    return time.add(+h, "hours").add(+m, "minutes");
  } else {
    return time.subtract(+h, "hours").subtract(+m, "minutes");
  }

}

function formatTime(time: Date, tz: string) {
  return applyOffset(dayjs(time), tz).format("YYYY-MM-DD[T]HH:mm:ss");
}

export async function querySacct(ssh: NodeSSH, logger: Logger, startTime?: Date, endTime?: Date) {

  // get the timezone of target machine
  const { stdout: tz } = await loggedExec(ssh, logger, true, "date", ["+%:z"]);

  const result = await loggedExec(ssh, logger, true,
    "sacct",
    [
      "-X",
      "--noheader",
      "--format", "JobID,JobName,Account,Partition,QOS,State,WorkDir,Reason,Elapsed,TimeLimit,Submit",
      ...startTime ? ["--starttime", formatTime(startTime, tz)] : [],
      ...endTime ? ["--endtime", formatTime(endTime, tz)] : [],
      "--parsable2",
    ],
  );

  if (result.stdout.length === 0) {
    return [];
  }

  const jobs = result.stdout.split("\n").map((x) => {
    const [
      jobId, name, account, partition, qos, state,
      workingDirectory, reason, elapsed, timeLimit, submitTime,
    ] = x.split("|");

    return {
      jobId: +jobId, name, account, partition, qos, state,
      workingDirectory, reason, elapsed, timeLimit, submitTime,
    } as JobInfo;
  });

  return jobs;
}
