import { loggedExec } from "@scow/lib-ssh";
import moment from "moment-timezone";
import { NodeSSH } from "node-ssh";
import { JobInfo } from "src/clusterops/api/job";
import { RunningJob } from "src/generated/common/job";
import { Logger } from "src/utils/log";

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

function formatTime(time: Date, tz: string) {
  return moment(time).tz(tz).format("YYYY-MM-DD[T]HH:mm:ss");
}

export async function querySacct(ssh: NodeSSH, logger: Logger, startTime: Date, endTime: Date) {

  // get target timezone
  const { stdout } = await loggedExec(ssh, logger, true, "date", ["+%:z"]);
  const tz = "UTC" + stdout;

  const result = await loggedExec(ssh, logger, true,
    "sacct",
    [
      "-X",
      "--noheader",
      "--format", "JobID,JobName,Account,Partition,QOS,State,WorkDir,Reason,Elapsed,TimeLimit,Submit",
      "--starttime", formatTime(startTime, tz),
      "--endtime", formatTime(endTime, tz),
      "--parsable2",
    ],
  );

  const jobs = result.stdout.split("\n").map((x) => {
    const [
      jobId, name, account, partition, qos, state,
      workingDir, reason, elapsed, timeLimit, submitTime,
    ] = x.split("|");

    return {
      jobId, name, account, partition, qos, state,
      workingDir, reason, elapsed, timeLimit, submitTime,
    } as JobInfo;
  });

  return jobs;
}
