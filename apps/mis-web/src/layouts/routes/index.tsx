import {
  AccountBookOutlined, BookOutlined, ClockCircleOutlined, CloudServerOutlined,
  DashboardOutlined,
  InfoOutlined, MoneyCollectOutlined, PartitionOutlined,
  PlusOutlined, PlusSquareOutlined, UserAddOutlined,
  UserOutlined } from "@ant-design/icons";
import React from "react";
import { AccountAffiliation } from "src/generated/server/user";
import Whitelist from "src/icons/whiteList.svg";
import { NavIcon } from "src/layouts/icon";
import { NavItemProps } from "src/layouts/NavItemProps";
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
          Icon: ClockCircleOutlined,
          text: "获取作业",
          path: "/admin/fetchJobs",
        },
        {
          Icon: UserOutlined,
          text: "导入用户",
          path: "/admin/importUsers",
        },
        {
          Icon: UserOutlined,
          text: "全部用户",
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
              text: "账户充值",
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
    clickToPath: "/tenant/info",
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
        {
          Icon: ClockCircleOutlined,
          text: "调整作业时间限制",
          path: "/tenant/jobTimeLimit",
        },
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

export const getAvailableRoutes = (user: User): NavItemProps[] => {


  const routes = [] as NavItemProps[];

  routes.push(...userRoutes(user.accountAffiliations));

  const adminAccounts = user.accountAffiliations.filter((x) => x.role !== UserRole.USER);
  if (adminAccounts.length > 0) {
    routes.push(...accountAdminRoutes(adminAccounts));
  }

  if (user.tenantRoles.length !== 0) {
    routes.push(...tenantRoutes(user.tenantRoles));
  }

  if (user.platformRoles.includes(PlatformRole.PLATFORM_ADMIN)) {
    routes.push(...platformAdminRoutes(user.platformRoles));
  }

  return routes;
};

export const iconToNode = (Icon: any) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon />;
};
