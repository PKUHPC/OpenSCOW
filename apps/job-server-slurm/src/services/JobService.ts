import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError, status } from "@grpc/grpc-js";
import { join } from "path";
import { checkClusterExistence, clustersConfig } from "src/config/clusters";
import { config } from "src/config/env";
import { RunningJob } from "src/generated/common/job";
import { JobServiceServer, JobServiceService, SavedJob } from "src/generated/portal/job";
import { loggedExec } from "src/plugins/ssh";
import { withTmpFile } from "src/utils/tmp";
import { SFTPWrapper } from "ssh2";
import { promisify } from "util";

export function parseSbatchOutput(output: string): number {
  // Submitted batch job 34987
  const splitted = output.split(" ");
  return +splitted[splitted.length - 1];
}


const exists = (sftp: SFTPWrapper, path: string) => new Promise<boolean>((res) => {
  sftp.stat(path, (err) => res(err === undefined));
});

const jobScriptName = "job.sh";
const jobMetadataName = "metadata.json";

interface JobMetadata {
  jobName: string;
  account: string;
  partition: string;
  qos: string;
  nodeCount: number;
  coreCount: number;
  maxTime: number;
  command: string;
  comment: string;
  submitTime: string;
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
      const { jobInfo: { jobName, account, coreCount, maxTime, nodeCount, partition, qos, command } }
        = ensureNotUndefined(request, ["jobInfo"]);

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
      const { cluster, script, jobInfo, userId } = ensureNotUndefined(request, ["jobInfo"]);

      checkClusterExistence(cluster);

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {

        const sftp = await ssh.requestSFTP();

        // create a dir named job name
        const dir = join(config.JOBS_DIR, jobInfo.jobName);

        // mkdir JOBS_DIR
        await ssh.mkdir(config.JOBS_DIR);

        // Query if job folder exists
        if (await exists(sftp, dir)) {
          throw <ServiceError> {
            code: status.ALREADY_EXISTS,
            message: `dir ${dir} already exists.`,
          };
        }

        await ssh.mkdir(dir);

        // saved metadata json
        await promisify(sftp.writeFile.bind(sftp))(join(dir, jobMetadataName), JSON.stringify({
          ...jobInfo,
          submitTime: new Date().toISOString(),
        } as JobMetadata));

        const scriptPath = join(dir, jobScriptName);

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

    getSavedJob: async ({ request, logger }) => {
      const { cluster, jobName, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        const dir = join(config.JOBS_DIR, jobName);
        const metadataPath = join(dir, jobMetadataName);

        const content = await promisify(sftp.readFile.bind(sftp))(metadataPath);

        const data = JSON.parse(content.toString()) as JobMetadata;

        return [{ jobInfo: data }];
      });
    },

    getSavedJobs: async ({ request, logger }) => {
      const { cluster, userId } = request;

      const node = clustersConfig[cluster].loginNodes[0];

      return await server.ext.connect(node, userId, logger, async (ssh) => {
        const sftp = await ssh.requestSFTP();

        if (!await exists(sftp, config.JOBS_DIR)) { return [{ results: []}]; }

        const list = await promisify(sftp.readdir.bind(sftp))(config.JOBS_DIR);

        const results = (await Promise.all(list.map(async ({ filename }) => {
          const jobDir = join(config.JOBS_DIR, filename);
          const metadataPath = join(jobDir, jobMetadataName);

          if (!await exists(sftp, config.JOBS_DIR)) {
            return undefined;
          }
          const content = await promisify(sftp.readFile.bind(sftp))(metadataPath);
          const data = JSON.parse(content.toString()) as JobMetadata;

          const absJobDir = await promisify(sftp.realpath.bind(sftp))(jobDir);

          return { jobName: data.jobName, submitTime: new Date(data.submitTime),
            comment: data.comment,  dirPath: absJobDir,
          };
        }))).filter((x) => x) as SavedJob[];

        return [{ results }];
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
