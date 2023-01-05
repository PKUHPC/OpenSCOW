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

import { executeAsUser } from "@scow/lib-ssh";
import { RunningJob } from "@scow/protos/build/common/job";
import { NodeSSH } from "node-ssh";
import { Logger } from "ts-log";

const SEPARATOR = "__x__x__";

export interface RunningJobFilter {
  userId?: string;
  accountNames?: string[];
  jobIdList?: string[];
}

export async function querySqueue(ssh: NodeSSH, userId: string, logger: Logger, params: string[]) {
  const result = await executeAsUser(ssh, userId, logger, true,
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

export async function getRunningJobs(ssh: NodeSSH, username: string, filterOptions: RunningJobFilter, logger: Logger) {
  const { userId, accountNames, jobIdList } = filterOptions;
  const result = await executeAsUser(ssh, username, logger, true,
    "sacct",
    [
      "--noheader",
      "--state=RUNNING,PENDING",
      "-P",
      `--delimiter=${SEPARATOR}`,
      "-o",
      "JobID,Partition,JobName,User,State,Elapsed,AllocNodes,NodeList,"
      + "Account,AllocCPUs,QOS,Submit,...,Timelimit,WorkDir",
      ...userId ? ["-u", userId] : [],
      ...accountNames ? (accountNames.length > 0 ? ["-A", accountNames.join(",")] : []) : [],
      ...jobIdList ? (jobIdList.length > 0 ? ["-j", jobIdList.join(",")] : []) : [],
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