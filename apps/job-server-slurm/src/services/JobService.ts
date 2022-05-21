import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { join } from "path";
import { config } from "src/config";
import { RunningJob } from "src/generated/common/job";
import { JobServiceServer, JobServiceService } from "src/generated/portal/job";
import { loggedExec } from "src/plugins/ssh";
import { checkClusterExistence, clustersConfig } from "src/utils/clusters";
import { withTmpFile } from "src/utils/tmp";

export function parseSbatchOutput(output: string): number {
  // Submitted batch job 34987
  const splitted = output.split(" ");
  return +splitted[splitted.length-1];
}

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    getAccounts: async ({ request, logger }) => {
      const { cluster, userId }  = request;

      const node = clustersConfig[cluster].loginNodes[0];
      const accounts = await server.ext.connect(node, userId, logger, async (ssh) => {
        const { stdout } = await loggedExec(ssh, logger, true,
          "sacctmgr", ["show", "ass", `user=${userId}`, "format=account%20"]);

        /**
          Account
      --------------------
      {account1}
      {account2}
         */

        const accounts = stdout.split("\n").slice(2).map((x) => x.trim());

        return accounts;
      });

      return [{ accounts }];
    },

    generateJobScript: async ({ request }) => {
      const { jobName, account, coreCount, maxTime, nodeCount, partition, qos, command } = request;

      let script = "#!/bin/bash\n";

      function append(param: string) {
        script += "#SBATCH " + param + "\n";
      }

      append("-A " + account);
      append("--partition=" + partition);
      append("--qos=" + qos);
      append("-J " + jobName);
      append("--nodes=" + nodeCount);
      append("-c " + coreCount);
      append("--time=" + maxTime);

      script += "\n";
      script += command;

      return [{ script }];
    },

    submitJob: async ({ request, logger }) => {
      const { cluster, script, jobName, userId } = request;

      checkClusterExistence(cluster);

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        // create a dir named job name
        const jobScriptName = "job.sh";
        const dir = join(config.JOBS_DIR, jobName);
        const scriptPath = join(dir, jobScriptName);
        const sftp = await ssh.requestSFTP();

        // Why not ssh.mkdir? Reports error if exists.

        const resp = await loggedExec(ssh, logger, false, "mkdir", [dir]);

        if (resp.code !== 0) {
          if (resp.stderr.includes("File exists")) {
            throw <ServiceError> {
              code: status.ALREADY_EXISTS,
              message: `dir ${dir} already exists.`,
            };
          } else {
            logger.error("mkdir %s failed. stdout %s, stderr %s", dir, resp.stdout, resp.stderr);
            throw <ServiceError> {
              code: status.INTERNAL,
              message: "error when mkdir job",
            };
          }
        }

        // create a tmp file and send the file into the cluster
        await withTmpFile(async ({ path, fd }) => { // write the command into the tmp file

          await fd.writeFile(script);

          // send the file into the dir
          await ssh.putFile(path, scriptPath, sftp);
        });

        // use sbatch to allocate the script
        const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
          "sbatch", [jobScriptName],
          { cwd: dir, stream: "both" },
        );

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

    getRunningJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;
      const separator = "__x__x__";

      checkClusterExistence(cluster);
      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const result = await loggedExec(ssh, logger, true,
          "squeue",
          [
            "-o",
            `'${["%A", "%P", "%j", "%u", "%T", "%M", "%D", "%R", "%a", "%C", "%q", "%V", "%Y", "%l"].join(separator)}'`,
            "--noheader",
            "-u", userId,
          ],
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
