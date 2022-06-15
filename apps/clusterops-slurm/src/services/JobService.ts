import { plugin } from "@ddadaal/tsgrpc-server";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { JobServiceServer, JobServiceService } from "src/generated/clusterops/job";
import { RunningJob } from "src/generated/common/job";
import { handleError } from "src/utils/slurm";


export const jobServiceServer = plugin((server) => {


  server.addService<JobServiceServer>(JobServiceService, {
    getRunningJobs: async ({ request }) => {
      const { userId, accountNames, jobIdList } = request;
      const separator = "__x__x__";
      const result = await server.ext.executeScript(
        "squeue",
        [
          "-o",
          ["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l"].join(separator),
          "--noheader",
          ...userId ? ["-u", userId] : [],
          ...accountNames.length > 0 ? ["-A", accountNames.join(",")] : [],
          ...jobIdList.length > 0 ? ["-j", jobIdList.join(",")] : [],
        ]);

      const jobs = result.stdout.split("\n").filter((x) => x).map((x) => {
        const [
          jobId,
          partition, name, user, state, runningTime,
          nodes, nodesOrReason, account, cores,
          qos, submissionTime, nodesToBeUsed, timeLimit,
        ] = x.split(separator);

        return {
          jobId,
          partition, name, user, state, runningTime,
          nodes, nodesOrReason, account, cores,
          qos, submissionTime, nodesToBeUsed, timeLimit,
        } as RunningJob;
      });

      return [{ jobs }];
    },

    queryJobTimeLimit: async ({ request }) => {
      const { jobId } = request;
      const result = await server.ext.executeSlurmScript(["-t", jobId]);

      handleError(result, { 7: Status.NOT_FOUND });

      // format is [d-]hh:mm:ss, 5-00:00:00 or 00:03:00
      // convert to second

      const results = result.stdout.trim().split(/-|:/).map((x) => +x);

      const [d, h, m, s] = results[3] === undefined
        ? [0, ...results]
        : results;

      return [{ limit: s + m * 60 + h * 60 * 60 + d * 60 * 60 * 24 }];
    },

    changeJobTimeLimit: async ({ request }) => {
      const { delta, jobId } = request;

      const result = await server.ext.executeSlurmScript(["-n", jobId, delta + ""]);

      handleError(result, { 7: Status.NOT_FOUND });

      return [{  }];
    },
  });
});
