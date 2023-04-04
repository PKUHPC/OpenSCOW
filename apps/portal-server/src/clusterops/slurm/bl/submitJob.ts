/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { JobTemplate } from "src/clusterops/api/job";

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
  gpuCount?: number;
  maxTime: number;
  command: string;
  comment?: string;
  submitTime: string;
  workingDirectory: string;
  memory?: string;
}

export function generateJobScript(jobInfo: JobTemplate & {
  output?: string;
  otherOptions?: string[];
}) {
  const {
    jobName, account, coreCount, gpuCount, maxTime, nodeCount,
    partition, qos, command, workingDirectory,
    output, otherOptions, memory,
  } = jobInfo;
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
  if (gpuCount) {
    append("--gres=gpu:" + gpuCount);
  }
  if (memory) {
    append("--mem=" + memory);
  }
  if (output) {
    append("--output=" + output);
  } else {
    append("--output=job.%j.out");
  }
  append("--error=job.%j.err");

  if (otherOptions) {
    otherOptions.forEach((opt) => {
      append(opt);
    });
  }


  script += "\n";
  script += command;

  return script;
}

export const JOB_METADATA_NAME = "metadata.json";


