import { JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { api } from "src/apis/api";
import type { RunningJob } from "src/generated/common/job";
import type { UserInfo } from "src/models/User";

export type MockApi<TApi extends Record<
  string,
 (...args: any[]) => JsonFetchResultPromiseLike<any>>
 > = { [key in keyof TApi]:
    (...args) =>
    Promise<
      ReturnType<TApi[key]> extends PromiseLike<infer TSuc>
      ? TSuc
      : never
    >
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
};

export const mockApi: MockApi<typeof api> = {

  getSavedJob: async () => ({
    jobInfo: {
      account: "123",
      command: "123",
      coreCount: 2,
      jobName: "123",
      maxTime: 123,
      nodeCount: 4,
      partition: "low",
      qos: "low",
    },
  }),

  getSavedJobs: async () => ({ results: [{
    jobName: "123", comment: "1234", submitTime: new Date().toString(),
    dirPath: "jobs/123",
  }]}),

  getIcon: async () => undefined,

  getLogo: async () => undefined,

  getAccounts: async () => ({ accounts: ["hpc01", "hpc02"]}),

  launchDesktop: async () => ({ node: "login01", password: "123", port: 1234 }),

  listDesktops: async () => ({
    result: {
      connections: [{
        node: "login01",
        cluster: "hpc01",
        displayId: [1, 2, 3],
      }],
    },
  }),

  createDesktop: async () => (
    {
      node: "login01",
      password: "123",
      port: 1234,
    }),

  killDesktop: async () => ({ message: "success!" }),


  logout: async () => null,

  authCallback: async () => undefined as never,

  changePassword: async () => null,

  validateToken: async () => MOCK_USER_INFO,

  getRunningJobs: async () => ({ results: [runningJob]}),

  submitJob: async () => ({ jobId: 10 }),
};

export const MOCK_USER_INFO = {
  identityId: "123",
} as UserInfo;
