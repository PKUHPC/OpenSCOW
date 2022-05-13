import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import fs from "fs";
import { join } from "path";
import { LOGIN_NODES } from "src/config";
import { RunningJob } from "src/generated/common/job";
import { JobServiceServer, JobServiceService } from "src/generated/portal/job";
import { withFile } from "tmp-promise";

export function parseSbatchOutput(output: string): number {
  // Submitted batch job 34987
  const splitted = output.split(" ");
  return +splitted[splitted.length-1];
}

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    submitJob: async ({ request }) => {
      const { command, jobName, userId } = request;

      const node = Object.keys(LOGIN_NODES)[0];
      return await server.ext.connect(node, async (ssh) => {
        // create a dir named job name
        const dir = `~/jobs/${jobName}`;
        const scriptPath = join(dir, "job.sh");
        await ssh.mkdir(dir);

        // create a tmp file and send the file into the cluster

        await withFile(async ({ path }) => {
          // write the command into the tmp file
          await fs.promises.writeFile(path, command);

          // send the file into the dir
          await ssh.putFile(path, scriptPath, null, {});
        });

        // call sbatch to submit the job
        const { code, stderr, stdout } = await server.ext.runAsUser(ssh, userId, "sbatch", scriptPath);

        if (code !== 0) {
          throw <ServiceError> {
            code: status.UNAVAILABLE,
            message: "slurm job submission failed.",
            details: stderr,
          };
        }

        // parse stdout output to get the job id
        const jobId = parseSbatchOutput(stdout);

        return [{ jobId }];
      });

    },

    getRunningJobs: async ({ request }) => {
      const { userId } = request;
      const separator = "__x__x__";

      const node = Object.keys(LOGIN_NODES)[0];

      return await server.ext.connect(node, async (ssh) => {
        const result = await server.ext.runAsUser(ssh, userId,
          "squeue",
          "-o",
          `'${["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l"].join(separator)}'`,
          "--noheader",
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
