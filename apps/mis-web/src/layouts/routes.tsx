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

import {
  AccountBookOutlined, BookOutlined, CloudServerOutlined,
  DashboardOutlined,
  InfoOutlined, LockOutlined, MoneyCollectOutlined, PartitionOutlined,
  PlusOutlined, PlusSquareOutlined, UserAddOutlined,
  UserOutlined } from "@ant-design/icons";
import { NavItemProps } from "@scow/lib-web/build/layouts/base/types";
import { NavIcon } from "@scow/lib-web/build/layouts/icon";
import { AccountAffiliation } from "@scow/protos/build/server/user";
import Whitelist from "src/icons/whiteList.svg";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";

export const platformAdminRoutes: (platformRoles: PlatformRole[]) => NavItemProps[] = (platformRoles) => [
  {
    Icon: UserOutlined,
    text: "平台管理",
    path: "/admin",
    clickable: false,
    children: [
      ...(platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ? [
        {
          Icon: UserOutlined,
          text: "导入用户",
          path: "/admin/importUsers",
        },
        {
          Icon: UserOutlined,
          text: "平台租户列表",
          path: "/admin/tenants",
        },
        {
          Icon: UserOutlined,
          text: "平台用户列表",
          path: "/admin/users",
        },
        {
          Icon: MoneyCollectOutlined,
          text: "查询作业计费项",
          path: "/admin/jobBillingItems",
        },
        {
          Icon: MoneyCollectOutlined,
          text: "管理作业价格表",
          path: "/admin/jobBillingTable",
        },
        {
          Icon: LockOutlined,
          text: "刷新slurm封锁状态",
          path: "/admin/slurmBlockStatus",
        },
      ] : []),
      ...(platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ? [
        {
          Icon: MoneyCollectOutlined,
          text: "财务管理",
          path: "/admin/finance",
          clickable: false,
          children: [
            {
              Icon: PlusSquareOutlined,
              text: "租户充值",
              path: "/admin/finance/pay",
            },
            {
              Icon: BookOutlined,
              text: "充值记录",
              path: "/admin/finance/payments",
            },
          ],
        },
      ] : []),
    ],
  },
];

export const tenantRoutes: (tenantRoles: TenantRole[]) => NavItemProps[] = (tenantRoles) => [
  {
    Icon: CloudServerOutlined,
    text: "租户管理",
    path: "/tenant",
    clickToPath: tenantRoles.includes(TenantRole.TENANT_ADMIN) ? "/tenant/info" : "/tenant/finance/payAccount",
    children: [
      ...(tenantRoles.includes(TenantRole.TENANT_ADMIN) ? [
        {
          Icon: InfoOutlined,
          text: "租户信息",
          path: "/tenant/info",
        },
        {
          Icon: MoneyCollectOutlined,
          text: "管理作业价格表",
          path: "/tenant/jobBillingTable",
        },
        {
          Icon: BookOutlined,
          text: "运行中的作业",
          path: "/tenant/runningJobs",
        },
        {
          Icon: BookOutlined,
          text: "已结束的作业",
          path: "/tenant/historyJobs",
        },
        {
          Icon: UserOutlined,
          text: "用户管理",
          path: "/tenant/users",
          clickToPath: "/tenant/users/list",
          children: [
            {
              Icon: UserOutlined,
              text: "用户列表",
              path: "/tenant/users/list",
            },
            ...(publicConfig.ENABLE_CREATE_USER ? [{
              Icon: UserAddOutlined,
              text: "创建用户",
              path: "/tenant/users/create",
            }] : []),
          ],
        },
        // {
        //   Icon: ClockCircleOutlined,
        //   text: "调整作业时间限制",
        //   path: "/tenant/jobTimeLimit",
        // },
        // {
        //   Icon: CloudOutlined,
        //   text: "调整用户存储空间",
        //   path: "/tenant/storage",
        // },
        {
          Icon: AccountBookOutlined,
          text: "账户管理",
          path: "/tenant/accounts",
          clickToPath: "/tenant/accounts/list",
          children: [
            {
              Icon: AccountBookOutlined,
              text: "账户列表",
              path: "/tenant/accounts/list",
            },
            {
              Icon: PlusOutlined,
              text: "创建账户",
              path: "/tenant/accounts/create",
            },
            {
              Icon: <NavIcon src={Whitelist} alt="Whitelist" />,
              text: "账户白名单",
              path: "/tenant/accounts/whitelist",
            },
          ],
        },
      ] : []),
      ...(tenantRoles.includes(TenantRole.TENANT_FINANCE) ? [
        {
          Icon: MoneyCollectOutlined,
          text: "财务管理",
          path: "/tenant/finance",
          clickable: false,
          children: [
            {
              Icon: PlusSquareOutlined,
              text: "账户充值",
              path: "/tenant/finance/payAccount",
            },
            {
              Icon: BookOutlined,
              text: "充值记录",
              path: "/tenant/finance/payments",
            },
          ],
        },
      ] : []),
    ],
  },
];

export const userRoutes: (accounts: AccountAffiliation[]) => NavItemProps[] = (accounts) => [
  {
    Icon: DashboardOutlined,
    text: "仪表盘",
    path: "/dashboard",
  },
  {
    Icon: BookOutlined,
    text: "用户空间",
    path: "/user",
    clickToPath: accounts.length > 0 ? "/user/runningJobs" : "/user/partitions",
    children: [
      ...(accounts.length > 0 ? [
        {
          Icon: BookOutlined,
          text: "未结束的作业",
          path: "/user/runningJobs",
        },
        {
          Icon: BookOutlined,
          text: "已结束的作业",
          path: "/user/historyJobs",
        },
      ] : []),
      {
        Icon: PartitionOutlined,
        text: "集群和分区信息",
        path: "/user/partitions",
      },
    ],

  },
];

export const accountAdminRoutes: (adminAccounts: AccountAffiliation[]) => NavItemProps[] = (accounts) => [
  {
    Icon: UserOutlined,
    text: "账户管理",
    path: "/accounts",
    children: accounts.map((x) => ({
      Icon: AccountBookOutlined,
      text: `${x.accountName}`,
      path: `/accounts/${x.accountName}`,
      clickable: false,
      children: [
        {
          Icon: InfoOutlined,
          text: "账户信息",
          path: `/accounts/${x.accountName}/info`,
        },
        {
          Icon: BookOutlined,
          text: "未结束的作业",
          path: `/accounts/${x.accountName}/runningJobs`,
        },
        {
          Icon: BookOutlined,
          text: "已结束的作业",
          path: `/accounts/${x.accountName}/historyJobs`,
        },
        {
          Icon: UserOutlined,
          text: "用户管理",
          path: `/accounts/${x.accountName}/users`,
        },
        {
          Icon: BookOutlined,
          text: "充值记录",
          path: `/accounts/${x.accountName}/payments`,
        },
        {
          Icon: BookOutlined,
          text: "消费记录",
          path: `/accounts/${x.accountName}/charges`,
        },
      ],

    })),
  },

];

export const getAvailableRoutes = (user: User | undefined): NavItemProps[] => {

  if (!user) { return []; }


  const routes = [] as NavItemProps[];

  routes.push(...userRoutes(user.accountAffiliations));

  const adminAccounts = user.accountAffiliations.filter((x) => x.role !== UserRole.USER);
  if (adminAccounts.length > 0) {
    routes.push(...accountAdminRoutes(adminAccounts));
  }

  if (user.tenantRoles.length !== 0) {
    routes.push(...tenantRoutes(user.tenantRoles));
  }

  if (user.platformRoles.length !== 0) {
    routes.push(...platformAdminRoutes(user.platformRoles));
  }

  return routes;
};

