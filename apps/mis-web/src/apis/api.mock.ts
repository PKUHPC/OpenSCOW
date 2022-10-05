import { JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { numberToMoney } from "@scow/lib-decimal";
import { api } from "src/apis/api";
import type { RunningJob } from "src/generated/common/job";
import type { Account } from "src/generated/server/account";
import { JobInfo } from "src/generated/server/job";
import type { AccountUserInfo, GetUserStatusReply } from "src/generated/server/user";
import { PlatformRole, TenantRole, UserInfo, UserRole, UserStatus } from "src/models/User";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";

export type MockApi<TApi extends Record<
  string,
 (...args : any[]) => JsonFetchResultPromiseLike<any>>
 > = { [key in keyof TApi]: null | (
    (...args: Parameters<TApi[key]>) =>
    Promise<
      ReturnType<TApi[key]> extends PromiseLike<infer TSuc>
      ? TSuc
      : never
    >)
  };



const mockJobInfo: JobInfo = {
  "biJobIndex": 3670368,
  "idJob": 5119061,
  "account": "hpc0006167252",
  "user": "1600011702",
  "partition": "C032M0128G",
  "nodelist": "a5u15n01",
  "jobName": "CoW",
  "cluster": "未名一号",
  "timeSubmit": "2020-04-23T22:23:00.000Z",
  "timeStart": "2020-04-23T22:25:12.000Z",
  "timeEnd": "2020-04-23T23:18:02.000Z",
  "gpu": 0,
  "cpusReq": 32,
  "memReq": 124000,
  "nodesReq": 1,
  "cpusAlloc": 32,
  "memAlloc": 124000,
  "nodesAlloc": 1,
  "timelimit": 7200,
  "timeUsed": 3170,
  "timeWait": 132,
  "qos": "normal",
  "recordTime": "2020-04-23T23:49:50.000Z",
  "accountPrice": numberToMoney(10),
  "tenantPrice": numberToMoney(20),
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

const mockAccounts: Required<Account>[] = [
  { accountName: "hpc123456", userCount: 3, blocked: true, tenantName: "default",
    ownerId: "123", ownerName: "哈哈", comment: "123", balance: numberToMoney(20) },
  { accountName: "hpc1234567", userCount: 10, blocked: false, tenantName: "default",
    ownerId: "123", ownerName: "哈哈哈哈", comment: "123", balance: numberToMoney(30) },
];

const mockUsers = [
  {
    tenantName: DEFAULT_TENANT_NAME,
    userId: "test",
    createTime: "2020-04-23T23:49:50.000Z",
    email: "test@test.com",
    name: "testuser",
    id: "123",
    tenantRoles: [TenantRole.TENANT_ADMIN, TenantRole.TENANT_FINANCE],
    platformRoles: [PlatformRole.PLATFORM_FINANCE, PlatformRole.PLATFORM_ADMIN],
    accountAffiliations: [
      { accountName: "hpc2001213077", role: UserRole.ADMIN },
      { accountName: "hpc2001213075", role: UserRole.USER },
    ],
  },
];

export const mockApi: MockApi<typeof api> = {
  getAllUsers: async () => ({ platformUsers: [
    { 
      userId: "test01", 
      name: "test01", 
      createTime: "2022-10-05T23:49:50.000Z", 
      platformRoles: [PlatformRole.PLATFORM_FINANCE, PlatformRole.PLATFORM_ADMIN],
    },
    {
      userId: "test02", 
      name: "test02", 
      createTime: "2022-10-05T23:49:50.000Z", 
      platformRoles: [PlatformRole.PLATFORM_FINANCE],
    },
    {
      userId: "test03", 
      name: "test03", 
      createTime: "2022-10-05T23:49:50.000Z", 
      platformRoles: [],
    },
  ]}),

  addBillingItem: async () => null,

  getTenants: async () => ({ names: ["DEFAULT", "another"]}),

  getBillingItems: async () => ({ items: [
    { id: "HPC01", path: "hpc01.compute.low", price: numberToMoney(0.04), amountStrategy: "gpu" },
    { id: "HPC02", path: "hpc01.compute.normal", price: numberToMoney(0.06), amountStrategy: "gpu" },
    { id: "HPC03", path: "hpc01.compute.high", price: numberToMoney(0.08), amountStrategy: "gpu" },
    { id: "HPC04", path: "hpc01.GPU.low", price: numberToMoney(10.00), amountStrategy: "gpu" },
    { id: "HPC05", path: "hpc01.GPU.normal", price: numberToMoney(12.00), amountStrategy: "gpu" },
    { id: "HPC06", path: "hpc01.GPU.high", price: numberToMoney(14.00), amountStrategy: "gpu" },
  ]}),

  setAsInitAdmin: async () => null,
  unsetInitAdmin: async () => null,

  initGetAccounts: async () => ({ accounts: mockAccounts }),

  initGetUsers: async () => ({ users: mockUsers }),

  getBillingTable: null,

  getIcon: async () => undefined,

  createInitAdmin: async () => null,

  importUsers: async () => null,

  completeInit: async () => null,

  getFetchJobInfo: async () => ({ fetchStarted: true, schedule: "*", lastFetchTime: new Date().toISOString() }),

  setFetchState: async () => null,
  fetchJobs: async () => ({ newJobsCount: 200 }),

  cancelJobChargeLimit: async () => null,
  setJobChargeLimit: async () => null,

  getRunningJobs: async () => ({ results: [runningJob]}),

  getTenantUsers: async () => ({ results: mockUsers }),

  logout: async () => null,

  getCharges: async () => ({ results: [{
    amount: 10,
    comment: "123",
    index: 1,
    time: "123",
    accountName: "123",
    ipAddress: "127.0.0.1",
    operatorId: "123",
    type: "Task",
  }], total: 10 }),

  getPayments: async () => ({ results: [{
    amount: 10,
    comment: "123",
    index: 1,
    time: "123",
    accountName: "123",
    ipAddress: "127.0.0.1",
    operatorId: "123",
    type: "Task",
  }], totalCount: 1, total: 10 }),

  getUsedPayTypes: async () => ({ types: ["Pay", "JobPriceChange"]}),

  changeJobPrice: async () => ({ count: 10 }),

  getJobByBiJobIndex: async () => ({ info: mockJobInfo }),

  getJobInfo: async () => ({ jobs: [mockJobInfo], totalCount: 1, totalPrice: numberToMoney(100) }),
  financePay: async () => ({ balance: 123 }),
  authCallback: async () => undefined as never,
  getUserStatus: async () => MOCK_USER_STATUS,
  getAccountUsers: async () => ({
    totalCount: 2,
    results: [
      {
        name: "123",
        status: UserStatus.BLOCKED,
        storageQuotas: {},
        userId: "123456",
        role: UserRole.ADMIN,
        jobChargeLimit: numberToMoney(20.4),
        usedJobChargeLimit: numberToMoney(10),
      },
      {
        name: "1234",
        status: UserStatus.UNBLOCKED,
        userId: "123456",
        role: UserRole.OWNER,
        storageQuotas: {
          "WM2": 100,
          "WM1": 200,
        },
      },
    ] as AccountUserInfo[],
  }),
  addUserToAccount: async () => null,
  // addUserToAccount: async () => { throw new HttpError(404, { code: "USER_NOT_FOUND" }); },
  blockUserInAccount: async () => ({ executed: true }),
  unblockUserInAccount: async () => ({ executed: true }),
  removeUserFromAccount: async () => null,
  setAdmin: async () => ({ executed: true }),
  unsetAdmin: async () => ({ executed: false }),
  queryStorageUsage: async () => ({ result: 10 }),
  changeStorageQuota: async () => ({ currentQuota: 10 }),
  queryStorageQuota: async () => ({ currentQuota: 10 }),
  getAccounts: async () => ({ totalCount: mockAccounts.length, results: mockAccounts }),
  changeJobTimeLimit: async () => null,
  queryJobTimeLimit: async () => ({ result: 10 }),
  createAccount: async () => null,
  dewhitelistAccount: async () => null,
  whitelistAccount: async () => null,
  getWhitelistedAccounts: async () => ({ results: [{
    accountName: "123",
    addTime: "2020-04-23T23:49:50.000Z",
    comment: "comment",
    operatorId: "123",
    ownerId: "123",
    ownerName: "123",
  }], totalCount: 1 }),

  changePassword: async () => null,
  createUser: async () => null,

  validateToken: async () => MOCK_USER_INFO,
};

export const MOCK_USER_INFO = {
  tenant: "default",
  name: "testuser",
  identityId: "123",
  token: "123",
  // accountAffiliations: [],
  // platformRoles: [],
  tenantRoles: [TenantRole.TENANT_ADMIN, TenantRole.TENANT_FINANCE],
  platformRoles: [PlatformRole.PLATFORM_FINANCE, PlatformRole.PLATFORM_ADMIN],
  accountAffiliations: [
    { accountName: "hpc2001213077", role: UserRole.ADMIN },
    { accountName: "hpc2001213075", role: UserRole.USER },
  ],
} as UserInfo;

export const MOCK_USER_STATUS: GetUserStatusReply = {
  storageQuotas: {
    "WM2": 100,
    "WM1": 200,
  },
  accountStatuses: {
    "hpc1": { userStatus: UserStatus.BLOCKED, accountBlocked: false },
    "hpc2": { userStatus: UserStatus.BLOCKED, accountBlocked: true,
      jobChargeLimit: numberToMoney(10),
      usedJobCharge: numberToMoney(2),
    },
  },
};
