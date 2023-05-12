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

import { JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import type { RunningJob } from "@scow/protos/build/common/job";
import { JobInfo } from "@scow/protos/build/portal/job";
import { api } from "src/apis/api";

export type MockApi<TApi extends Record<
  string,
 (...args: any[]) => JsonFetchResultPromiseLike<any>>
 > = { [key in keyof TApi]: null | (
    (...args: Parameters<TApi[key]>) =>
    Promise<
      ReturnType<TApi[key]> extends PromiseLike<infer TSuc>
      ? TSuc
      : never
    >)
  };

export const runningJob: RunningJob = {
  jobId: "123",
  account: "123",
  cores: "123",
  name: "123",
  nodes: "123",
  nodesOrReason: "!23",
  nodesToBeUsed: "123",
  partition: "123",
  qos: "123",
  runningTime: "123",
  state: "PENDING",
  submissionTime: "2021-12-22T16:16:02",
  user: "!23",
  timeLimit: "NOT_SET",
  workingDir: "/home/ddadaal/Code",
};

export const job: JobInfo = {
  jobId: 123,
  account: "123",
  name: "123",
  partition: "123",
  qos: "123",
  state: "PENDING",
  timeLimit: "NOT_SET",
  workingDirectory: "/home/ddadaal/Code",
  elapsed: "00:00:00",
  reason: "None",
  submitTime: "2022-07-07T09:21:42",
  startTime: "2022-07-07T09:21:42",
  endTime: "2022-07-07T09:21:52",
};

export const mockApi: MockApi<typeof api> = {

  getClusterInfo: async ({ query: { cluster } }) => ({ clusterInfo: {
    submitJobDirTemplate: "/home/ddadaal/Code/{{ name }}",
    slurm: {
      partitions: [
        { cores: 123, name: "123", nodes: 123, qos: ["123"], gpus: 10, mem: 1000 },
        { cores: 1234, name: cluster, nodes: 1234, qos: ["1234"], gpus: 10, mem: 1000 },
        { name : "compute", mem: 2048, cores:2, gpus:0, nodes: 1, qos: ["normal"], comment: "两个计算节点分区" },
        { name : "GPU", mem: 2048, cores:2, gpus:2, nodes: 1, qos: ["normal"], comment: "GPU" },
      ],
    },
  } }),

  checkAppConnectivity: async () => ({
    ok: Math.random() < 0.5,
  }),

  getAllJobs: async () => ({ results: [job]}),

  listAvailableApps: async () => ({ apps: [
    { id: "vscode", name: "VSCode" },
    { id: "emacs", name: "Emacs" },
  ]}),

  listFile: null,

  copyFileItem: null,
  createFile: null,
  deleteDir: null,
  deleteFile: null,
  getHomeDirectory: null,
  mkdir: null,
  moveFileItem: null,

  downloadFile: null,
  uploadFile: null,
  fileExist: null,
  getFileType: null,

  createAppSession: async () => ({ jobId: 123, sessionId: "is" }),

  cancelJob: async () => null,

  listAvailableWms: async () => ({
    wms: [{ name: "cinnamon", wm: "Cinnamon" }, { name: "gnome", wm: "GNOME" }],
  }),

  getAppSessions: async () => ({ sessions: [
    { jobId: 100, sessionId: "123", appId: "vscode", state: "PENDING", reason: "resource",
      submitTime: new Date().toISOString(), host: "192.168.88.100", port: 1000, dataPath: "/test",
      timeLimit: "01:00:00", runningTime: "" },
    { jobId: 101, sessionId: "124", appId: "vscode", state: "RUNNING",
      submitTime: new Date().toISOString(), dataPath: "/test",
      timeLimit: "1-01:00:00", runningTime: "01:50" },
    { jobId: 102, sessionId: "125", appId: "vscode", state: "RUNNING",
      submitTime: new Date().toISOString(), host: "192.168.88.100", port: 10000, dataPath: "/test",
      timeLimit: "INVALID", runningTime: "01:55" },
  ]}),

  getAppMetadata: async () => ({
    appName: "test",
    appCustomFormAttributes: [
      { type: "NUMBER", label: "版本", name: "version", required: false,
        placeholder: "选择版本", defaultValue: 123, select: []},
      { type: "TEXT", label: "文字", name: "text", required: false,
        placeholder: "提示信息", defaultValue: 555, select: []},
      { type: "TEXT", label: "其他sbatch参数", name: "sbatchOptions",
        required: true, placeholder: "比如：--gpus gres:2 --time 10", select: []},
      { type: "SELECT", label: "选项", name: "option", required: false,
        placeholder: "提示信息", defaultValue: "version2", select: [
          { label: "版本1", value: "version1" },
          { label: "版本2", value: "version2" },
        ]},
    ]}),

  connectToApp: async ({ body: { sessionId } }) => sessionId === "124"
    ? {
      host: "127.0.0.1", port: 3000, password: "123", type: "web",
      connect: {
        method: "POST",
        path: "/test",
        query: { test: "!23" },
        formData: { test: "123" },
      },
      proxyType: "relative",
      customFormData: { USERNAME: "bob" },
    }
    : {
      host: "127.0.0.1", port: 3000, password: "123", type: "vnc",
    }
  ,

  getJobTemplate: async () => ({
    template: {
      account: "123",
      command: "123",
      coreCount: 2,
      jobName: "123",
      maxTime: 123,
      nodeCount: 4,
      partition: "low",
      qos: "low",
      output: "job.%j.out",
      errorOutput: "job.%j.err",
      workingDirectory: "/nfs/jobs/123",
    },
  }),

  listJobTemplates: async () => ({ results: [{
    id: "123-sample-apple",
    comment: "1234",
    submitTime: new Date().toString(),
    jobName: "sample-apple",
  }]}),

  getAccounts: async () => ({ accounts: ["hpc01", "hpc02"]}),

  launchDesktop: async () => ({ host: "login01", password: "123", port: 1234 }),

  listDesktops: async () => ({
    host: "login01",
    displayId: [1, 2, 3],
  }),

  createDesktop: async () => (
    {
      host: "login01",
      password: "123",
      port: 1234,
    }),

  killDesktop: async () => null,

  logout: async () => null,

  authCallback: async () => undefined as never,

  changePassword: async () => null,

  validateToken: null,

  getRunningJobs: async () => ({ results: [runningJob]}),

  submitJob: async () => ({ jobId: 10 }),

  getAppLastSubmission: async () => ({
    lastSubmissionInfo: {
      userId: "test123",
      cluster: "hpc01",
      appId: "vscode",
      appName: "VSCode",
      account: "a_aaaaaa",
      partition: "compute",
      qos: "high",
      coreCount: 2,
      maxTime: 10,
      submitTime: "2021-12-22T16:16:02",
      customAttributes: { selectVersion: "code-server/4.9.0", sbatchOptions: "--time 10" },
    },
  }),

};

