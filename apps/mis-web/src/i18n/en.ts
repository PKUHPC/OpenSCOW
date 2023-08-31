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

export default {
  dashboard: {
    title: "Dashboard",
    account: {
      title: "Account Information",
      state: "State",
      balance: "Available Balance",
      status: {
        blocked: "Blocked",
        normal: "Normal",
      },
      alert: "You don't belong to any account.",
    },
    job: {
      title: "Unfinished Job List",
      extra: "View All Unfinished Jobs",
      jobTable: {
        cluster: "Cluster",
        jobId: "Job ID",
        account: "Account",
        name: "Job Name",
        partition:  "Partition",
        qos: "QOS",
        nodes: "Nodes",
        cores: "Cores",
        state: "State",
        time: "Runtime/Queue Time",
        reason: "Reason",
        limit: "Job Time Limit",
        others: "Others",
      },
      none: "No data available",
    },
  },

  footer: "Powered by SCOW",
  runningJob: {
    title: "Your Unfinished Jobs",
    search: {
      batch: "Batch Search",
      precision: "Precision Search",
      cluster: "Cluster",
      account: "Account",
      clusterJobId: "Cluster Job ID",
      button: {
        search: "Search",
        refresh: "Refresh",
        changeLimit: "Extend Time Limit of Selected Jobs",
      },
    },
    jobTable: {
      cluster:  "Cluster",
      jobId: "Job",
      account: "Account",
      name: "Job Name",
      partition: "Partition",
      qos: "QoS",
      nodes: "Nodes",
      cores: "Cores",
      state: "State",
      time: "Runtime/Queue Time",
      reason: "Reason",
      limit: "Job Time Limit",
      others: "Others",
      user: "User",
      details: "Details",
      changeLimit: "Change Job Time Limit",
      gpus: "GPUS",
    },
  },
  layouts: {
    route: {
      navLinkText: "PORTAL",
      dashboard: "Dashboard",
      user: {
        firstNav: "User",
        runningJobs: "Running Jobs",
        finishedJobs: "Finished Jobs",
        clusterPartitions: "Cluster and Partition Info",
      },
      platformManagement: {
        fistNav: "Platform Management",
        info: "Platform Info",
        importUsers: "Import Users",
        tenantsManagement: "Tenant Management",
        tenantsList: "Tenant List",
        createTenant: "Create Tenant",
        usersList: "User List",
        jobBillingTable: "Job Billing Table",
        financeManagement: "Finance Management",
        tenantPay: "Tenant Top Up",
        payments: "Tenant Top Up History",
        systemDebug: "System Debug",
        statusSynchronization: "Status Synchronization",
        jobSynchronization: "Jobs Synchronization",
        accountList: "Account List",
      },
      tenantManagement: {
        firstNav: "Tenant Management",
        info: "Tenant Info",
        manageJobPrice: "Job Price Management",
        runningJobs: "Runing Jobs",
        finishedJobs: "Finished Jobs",
        userManagement: "User Management",
        userList: "User List",
        createUser: "Create Users",
        jobTimelimit: "Change Job Time Limit",
        storage: "Change User Storage",
        accountManagement: "Account Management",
        accountList: "Account List",
        createAccount: "Create Account",
        whitelist: "Account Whitelist",
        financeManagement: "Finance Management",
        accountPay: "Account Top Up",
        financePayments: "Top Up History",
        accountPayments: "Account Top Up History",
      },
      accountManagement: {
        firstNav: "Account Management",
        info: "Account Info",
        runningJobs: "Running Jobs",
        finishedJobs: "Finished Jobs",
        userManagement: "User Management",
        pay: "User Top Up History",
        cost: "User Cost List",
      },
    },
  },
};
// export default {
//   title: "react-typed-i18n testing ",
//   clicked: "Clicked {} times",
//   button: {
//     active: "Active Button",
//     inactive: "Inactive Button",
//   },
// };



