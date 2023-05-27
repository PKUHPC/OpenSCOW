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

import { HttpError, JsonFetchResultPromiseLike } from "@ddadaal/next-typed-api-routes-runtime/lib/client";
import { numberToMoney } from "@scow/lib-decimal";
import type { RunningJob } from "@scow/protos/build/common/job";
import type { Account } from "@scow/protos/build/server/account";
import { JobInfo } from "@scow/protos/build/server/job";
import type { AccountUserInfo, GetUserStatusResponse } from "@scow/protos/build/server/user";
import { api } from "src/apis/api";
import { ClusterAccountInfo_ImportStatus, PlatformRole,
  TenantRole, UserInfo, UserRole, UserStatus } from "src/models/User";
import { DEFAULT_TENANT_NAME } from "src/utils/constants";

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

  getMissingDefaultPriceItems: async () => {
    return { items: ["test.test", "test1.test2"]};
  },

  getAllTenants: async () => (
    {
      totalCount: 3,
      platformTenants: [{
        tenantId: 1,
        tenantName: "test1",
        balance: numberToMoney(0.0000),
        userCount: 1,
        accountCount:1,
        createTime: "2022-10-05T23:49:50.000Z",
      },
      {
        tenantId: 2,
        tenantName: "test2",
        balance: numberToMoney(10.0000),
        userCount: 4,
        accountCount:2,
        createTime: "2022-10-05T23:49:50.000Z",
      },
      {
        tenantId: 3,
        tenantName: "test3",
        balance: numberToMoney(10.5),
        userCount: 5,
        accountCount:3,
        createTime: "2022-10-05T23:49:50.000Z",
      },
      ],
    }),

  getAllUsers: async () => ({
    totalCount: 3,
    platformUsers: [
      {
        userId: "123",
        name: "testuser",
        availableAccounts: ["a_123"],
        tenantName: "tenant1",
        createTime: "2022-10-05T23:49:50.000Z",
        platformRoles: [PlatformRole.PLATFORM_FINANCE, PlatformRole.PLATFORM_ADMIN],
      },
      {
        userId: "test01",
        name: "test01",
        availableAccounts: ["a_test", "a_test01"],
        tenantName: "tenant2",
        createTime: "2022-10-05T23:49:50.000Z",
        platformRoles: [PlatformRole.PLATFORM_FINANCE, PlatformRole.PLATFORM_ADMIN],
      },
      {
        userId: "test02",
        name: "test02",
        availableAccounts: ["a_test", "a_test02"],
        tenantName: "tenant2",
        createTime: "2022-10-05T23:49:50.000Z",
        platformRoles: [PlatformRole.PLATFORM_FINANCE],
      },
      {
        userId: "test03",
        name: "test03",
        availableAccounts: ["a_test", "a_test03"],
        tenantName: "tenant2",
        createTime: "2022-10-05T23:49:50.000Z",
        platformRoles: [],
      },
    ],
  }),

  userExists: async () => ({
    existsInScow: false,
    existsInAuth: false,
  }),

  setPlatformRole: async () => ({ executed: true }),

  unsetPlatformRole: async () => ({ executed: false }),

  setTenantRole: async () => ({ executed: true }),

  unsetTenantRole: async () => ({ executed: false }),

  addBillingItem: async () => null,

  getTenants: async () => ({ names: ["DEFAULT", "another"]}),

  getBillingItems: async () => ({
    activeItems: [
      { cluster: "hpc01", partition: "compute", qos: "low",
        priceItem: { itemId: "HPC08", price: numberToMoney(0.01), amountStrategy: "max-cpusAlloc-mem" } },
      { cluster: "hpc01", partition: "compute", qos: "normal",
        priceItem: { itemId: "HPC02", price: numberToMoney(0.06), amountStrategy: "gpu" } },
      { cluster: "hpc01", partition: "compute", qos: "high",
        priceItem: { itemId: "HPC03", price: numberToMoney(0.08), amountStrategy: "gpu" } },
      { cluster: "hpc01", partition: "GPU", qos: "low",
        priceItem: { itemId: "HPC04", price: numberToMoney(10.00), amountStrategy: "gpu" } },
      { cluster: "hpc01", partition: "GPU", qos: "normal",
        priceItem: { itemId: "HPC05", price: numberToMoney(12.00), amountStrategy: "gpu" } },
      { cluster: "hpc01", partition: "GPU", qos: "high",
        priceItem: { itemId: "HPC06", price: numberToMoney(14.00), amountStrategy: "gpu" } },
    ],
    historyItems: [
      { cluster: "hpc01", partition: "compute", qos: "low",
        priceItem: { itemId: "HPC01", price: numberToMoney(0.04), amountStrategy: "max-cpusAlloc-mem" } },
      { cluster: "hpc01", partition: "compute", qos: "low",
        priceItem: { itemId: "HPC07", price: numberToMoney(0.02), amountStrategy: "gpu" } },
    ],
    nextId: "1",
  }),

  setAsInitAdmin: async () => null,
  unsetInitAdmin: async () => null,

  initGetAccounts: async () => ({ accounts: mockAccounts }),

  initGetUsers: async () => ({ users: mockUsers }),

  getBillingTable: null,

  createInitAdmin: async () => ({ createdInAuth: false }),

  importUsers: async () => null,

  getClusterUsers: async () => {
    return ({
      accounts: [
        {
          accountName: "a_user1",
          users: [
            { userId: "user1", userName: "user1", blocked: false },
            { userId: "user2", userName: "user2", blocked: false },
          ],
          owner: "user1",
          importStatus: ClusterAccountInfo_ImportStatus.NOT_EXISTING,
          blocked: false,
        },
        {
          accountName: "account2",
          users: [
            { userId: "user2", userName: "user2", blocked: false },
            { userId: "user3", userName: "user3", blocked: false },
          ],
          importStatus: ClusterAccountInfo_ImportStatus.HAS_NEW_USERS,
          blocked: false,
        },
        {
          accountName: "a_user4",
          users: [{ userId: "user4", userName: "user4", blocked: false }],
          importStatus: ClusterAccountInfo_ImportStatus.EXISTING,
          blocked: false,
        },
      ],
    });
  },

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

  getTenantPayments: async () => ({ results: [{
    amount: 10,
    comment: "123",
    index: 1,
    time: "123",
    tenantName: "default",
    ipAddress: "127.0.0.1",
    operatorId: "123",
    type: "Task",
  }], totalCount: 1, total: 10 }),

  getUsedPayTypes: async () => ({ types: ["Pay", "JobPriceChange"]}),

  changeJobPrice: async () => ({ count: 10 }),

  getJobByBiJobIndex: async () => ({ info: mockJobInfo }),

  getJobInfo: async () => ({ jobs: [mockJobInfo], totalCount: 1, totalPrice: numberToMoney(100) }),
  financePay: async () => ({ balance: 123 }),
  tenantFinancePay: async () => ({ balance: 123 }),
  authCallback: async () => undefined as never,
  getUserStatus: async () => MOCK_USER_STATUS,
  getAccountUsers: async () => ({
    totalCount: 2,
    results: [
      {
        name: "123",
        email: "123@123.com",
        status: UserStatus.BLOCKED,
        storageQuotas: {},
        userId: "123456",
        role: UserRole.ADMIN,
        jobChargeLimit: numberToMoney(20.4),
        usedJobChargeLimit: numberToMoney(10),
      },
      {
        name: "1234",
        email: "1234@123.com",
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
  // addUserToAccount: async () => null,
  addUserToAccount: async ({ body }) => {
    if (body.name === "404") {
      throw new HttpError(404, { code: "USER_NOT_FOUND" });
    } else {
      return null;
    }
  },
  blockUserInAccount: async () => ({ executed: true }),
  unblockUserInAccount: async () => ({ executed: true }),
  updateBlockStatus: async () => null,
  removeUserFromAccount: async () => null,
  setAdmin: async () => ({ executed: true }),
  unsetAdmin: async () => ({ executed: false }),
  queryStorageUsage: async () => ({ result: 10 }),
  changeStorageQuota: async () => ({ currentQuota: 10 }),
  queryStorageQuota: async () => ({ currentQuota: 10 }),
  getAccounts: async () => ({ totalCount: mockAccounts.length, results: mockAccounts }),
  changeJobTimeLimit: async () => null,
  queryJobTimeLimit: async () => ({ result: 10 }),
  createAccount: async () => { return {}; },
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
  changePasswordAsPlatformAdmin: async () => null,
  changePasswordAsTenantAdmin: async () => null,
  createUser: async () => (
    { id: 1,
      createdInAuth: false,
    }),
  createTenant: async () => ({ createdInAuth: true }),
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

export const MOCK_USER_STATUS: GetUserStatusResponse = {
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

