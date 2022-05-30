import { Logger } from "@ddadaal/tsgrpc-server";
import { NodeSSH } from "node-ssh";
import { RunningJob } from "src/generated/common/job";
import { loggedExec } from "src/plugins/ssh";

const SEPARATOR = "__x__x__";

export async function queryJobInfo(ssh: NodeSSH, logger: Logger, params: string[]) {
  const result = await loggedExec(ssh, logger, true,
    "squeue",
    [
      "-o",
      `'${["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l"].join(SEPARATOR)}'`,
      "--noheader",
      ...params,
    ],
  );

  const jobs = result.stdout.split("\n").filter((x) => x).map((x) => {
    const [
      jobId,
      partition, name, user, state, runningTime,
      nodes, nodesOrReason, account, cores,
      qos, submissionTime, nodesToBeUsed, timeLimit,
    ] = x.split(SEPARATOR);

    return {
      jobId,
      partition, name, user, state, runningTime,
      nodes, nodesOrReason, account, cores,
      qos, submissionTime, nodesToBeUsed, timeLimit,
    } as RunningJob;
  });

  return jobs;
}
