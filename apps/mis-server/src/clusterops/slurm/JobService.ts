import { JobOps } from "src/clusterops/api/job";
import { SlurmClusterInfo } from "src/clusterops/slurm";
import { executeScript } from "src/clusterops/slurm/utils/slurm";
import { RunningJob } from "src/generated/common/job";

export const slurmJobOps = ({ slurmConfig, executeSlurmScript }: SlurmClusterInfo): JobOps => {

  return {
    getRunningJobs: async ({ request, logger }) => {
      const { userId, accountNames, jobIdList } = request;
      const separator = "__x__x__";
      const result = await executeScript(
        slurmConfig,
        "squeue",
        [
          "-o",
          ["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l", "%Z"].join(separator),
          "--noheader",
          ...userId ? ["-u", userId] : [],
          ...accountNames.length > 0 ? ["-A", accountNames.join(",")] : [],
          ...jobIdList.length > 0 ? ["-j", jobIdList.join(",")] : [],
        ], {}, logger);

      const jobs = result.stdout.split("\n").filter((x) => x).map((x) => {
        const [
          jobId,
          partition, name, user, state, runningTime,
          nodes, nodesOrReason, account, cores,
          qos, submissionTime, nodesToBeUsed, timeLimit, workingDir,
        ] = x.split(separator);

        return {
          jobId,
          partition, name, user, state, runningTime,
          nodes, nodesOrReason, account, cores,
          qos, submissionTime, nodesToBeUsed, timeLimit,
          workingDir,
        } as RunningJob;
      });

      return { jobs };
    },

    queryJobTimeLimit: async ({ request, logger }) => {
      const { jobId } = request;
      const result = await executeSlurmScript(["-t", jobId], logger);

      if (result.code === 7)  {
        return { code: "NOT_FOUND" };
      }

      // format is [d-]hh:mm:ss, 5-00:00:00 or 00:03:00
      // convert to second

      const results = result.stdout.trim().split(/-|:/).map((x) => +x);

      const [d, h, m, s] = results[3] === undefined
        ? [0, ...results]
        : results;

      return { code: "OK", limit: s + m * 60 + h * 60 * 60 + d * 60 * 60 * 24 };
    },

    changeJobTimeLimit: async ({ request, logger }) => {
      const { delta, jobId } = request;

      const result = await executeSlurmScript(["-n", jobId, delta + ""], logger);

      if (result.code === 7)  {
        return { code: "NOT_FOUND" };
      }

      return { code: "OK" };
    },
  };
};
