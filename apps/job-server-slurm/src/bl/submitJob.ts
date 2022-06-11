import { Logger } from "@ddadaal/tsgrpc-server";
import { NodeSSH } from "node-ssh";
import { JobInfo } from "src/generated/portal/job";
import { loggedExec } from "src/plugins/ssh";
import { SFTPWrapper } from "ssh2";

export function parseSbatchOutput(output: string): number {
  // Submitted batch job 34987
  const splitted = output.split(" ");
  return +splitted[splitted.length - 1];
}

export interface JobMetadata {
  jobName: string;
  account: string;
  partition?: string;
  qos?: string;
  nodeCount: number;
  coreCount: number;
  maxTime: number;
  command: string;
  comment?: string;
  submitTime: string;
  workingDirectory: string;
}

export function generateJobScript(jobInfo: JobInfo & { output?: string }) {
  const { jobName, account, coreCount, maxTime, nodeCount, partition, qos, command, workingDirectory,
    output } = jobInfo;

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
  append("--chdir=" + workingDirectory);
  if (output) {
    append("--output=" + output);
  }


  script += "\n";
  script += command;

  return script;
}

interface SubmitJobParams {
  jobInfo: JobInfo;
  logger: Logger;
  ssh: NodeSSH;
  env?: NodeJS.ProcessEnv;
}

export const JOB_METADATA_NAME = "metadata.json";

type SubmitJobResult =
  | { code: "OK", jobId: number, sftp: SFTPWrapper, submitTime: Date }
  | { code: "SBATCH_FAILED", message: string };

export async function submitJob(params: SubmitJobParams): Promise<SubmitJobResult> {

  const { jobInfo, logger, ssh, env } = params;

  const dir = jobInfo.workingDirectory;

  const script = generateJobScript(jobInfo);

  const sftp = await ssh.requestSFTP();

  // make sure workingDirectory exists.
  await ssh.mkdir(dir);

  // use sbatch to allocate the script. pass the script into sbatch in stdin
  const { code, stderr, stdout } = await loggedExec(ssh, logger, false,
    "sbatch", [],
    { stdin: script, stream: "both", execOptions: { env } },
  );

  if (code !== 0) {
    return { code: "SBATCH_FAILED", message: stderr };
  }

  // parse stdout output to get the job id
  const jobId = parseSbatchOutput(stdout);

  return { code: "OK", jobId, sftp, submitTime: new Date() };

}

