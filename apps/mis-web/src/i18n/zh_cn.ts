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
    title: "仪表盘",
    account: {
      title: "账户信息",
      state: "状态",
      balance: "可用余额",
      status: {
        blocked: "封锁",
        normal: "正常",
      },
      alert: "您不属于任何一个账户。",
    },

    job: {
      title: "未结束作业列表",
      extra: "查看所有未结束作业",
      jobTable: {
        cluster: "集群",
        jobId: "作业ID",
        account: "账户",
        name: "作业名",
        partition: "分区",
        qos: "QOS",
        nodes: "节点数",
        cores: "核心数",
        state: "状态",
        time: "运行/排队时间",
        reason: "说明",
        limit: "作业时间限制",
        others: "更多",
      },
      none: "暂无数据",
    },
  },

  footer: "Powered by SCOW",

  runningJob: {
    title: "本用户未结束的作业",
    search: {
      batch: "批量搜索",
      precision: "精确搜索",
      cluster: "集群",
      account: "账户",
      clusterJobId: "集群作业ID",
      button: {
        search: "搜索",
        refresh: "刷新",
        changeLimit: "延长所选作业时间限制",
      },
    },
    jobTable: {
      cluster: "集群",
      jobId: "作业",
      account: "账户",
      name: "作业名",
      partition: "分区",
      qos: "QOS",
      nodes: "节点数",
      cores: "核心数",
      state: "状态",
      time: "运行/排队时间",
      reason: "说明",
      limit: "作业时间限制",
      others: "更多",
      user: "用户",
      details: "详情",
      changeLimit: "修改作业时限",
      gpus: "GPU卡数",
    },
  },
  layouts: {
    route: {
      navLinkText: "门户",
      dashboard: "仪表盘",
      user: {
        firstNav: "用户空间",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        clusterPartitions: "集群和分区信息",
      },
      platformManagement: {
        fistNav: "平台管理",
        info: "平台信息",
        importUsers: "导入用户",
        tenantsManagement:"租户管理",
        tenantsList: "租户列表",
        createTenant: "创建租户",
        usersList: "用户列表",
        jobBillingTable: "作业价格表",
        financeManagement: "财务管理",
        tenantPay: "租户充值",
        payments: "充值记录",
        systemDebug: "平台调试",
        statusSynchronization: "封锁状态同步",
        jobSynchronization: "作业信息同步",
        accountList: "账户列表",
      },
      tenantManagement: {
        firstNav: "租户管理",
        info: "租户信息",
        manageJobPrice: "作业价格表",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        userManagement: "用户管理",
        userList: "用户列表",
        createUser: "创建用户",
        jobTimelimit: "调整作业时间限制",
        storage: "调整用户存储空间",
        accountManagement: "账户管理",
        accountList: "账户列表",
        createAccount: "创建账户",
        whitelist: "账户白名单",
        financeManagement: "财务管理",
        accountPay: "账户充值",
        financePayments: "充值记录",
        accountPayments: "账户充值记录",
      },
      accountManagement: {
        firstNav:"账户管理",
        info: "账户信息",
        runningJobs: "未结束的作业",
        finishedJobs: "已结束的作业",
        userManagement: "用户管理",
        pay: "充值记录",
        cost: "消费记录",
      },
    },
  },
};
