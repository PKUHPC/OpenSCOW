import { plugin } from "@ddadaal/tsgrpc-server";
import { LOGIN_NODES } from "src/config";
import { RunningJob } from "src/generated/common/job";
import { JobServiceServer, JobServiceService } from "src/generated/portal/job";

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {
    getRunningJobs: async ({ request }) => {
      const { userId } = request;
      const separator = "__x__x__";

      const node = Object.keys(LOGIN_NODES)[0];

      return await server.ext.connect(node, async (ssh) => {
        const result = await server.ext.runAsUser(ssh, userId,
          "squeue",
          "-o",
          `'${["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l"].join(separator)}'`,
          "-u", userId,
        );

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
      });

    },
  });
});
