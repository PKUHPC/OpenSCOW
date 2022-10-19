import { loggedExec } from "@scow/lib-ssh";
import moment from "moment";
import { NodeSSH } from "node-ssh";
import { JobInfo } from "src/clusterops/api/job";
import { RunningJob } from "src/generated/common/job";
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

function applyOffset(time: moment.Moment, tz: string): moment.Moment {
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
  return applyOffset(moment(time), tz).format("YYYY-MM-DD[T]HH:mm:ss");
}

export async function querySacct(ssh: NodeSSH, logger: Logger, startTime?: Date, endTime?: Date) {

  // get target timezone
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
