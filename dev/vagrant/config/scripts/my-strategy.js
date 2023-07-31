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

// export interface JobInfo {
//   // cluster job id
//   jobId: number;
//   // scow cluster id
//   cluster: string;
//   partition: string;
//   qos: string;
//   timeUsed: number;
//   cpusAlloc: number;
//   gpu: number;
//   memReq: number;
//   memAlloc: number;
//   account: string;
//   tenant: string;
// }

// type MyStrategy = (jobInfo: JobInfo) => number | Promise<number>;

function myStrategy(jobInfo) {
  if (jobInfo.timeUsed > 180) {
    return 0;
  }
  return 8;
}

module.exports = myStrategy;
