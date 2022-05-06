import AntdIcon, {
  AccountBookOutlined, BookOutlined, ClockCircleOutlined, CloudServerOutlined,
  DashboardOutlined,
  InfoOutlined, MoneyCollectOutlined, PartitionOutlined,
  PlusOutlined, PlusSquareOutlined, UserAddOutlined,
  UserOutlined } from "@ant-design/icons";
import React from "react";
import { AccountAffiliation } from "src/generated/server/user";
import { ReactComponent as Whitelist } from "src/icons/whiteList.svg";
import { NavItemProps } from "src/layouts/NavItemProps";
import { TenantRole, UserRole } from "src/models/User";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";

export const tenantFinanceRoutes: NavItemProps[] = [
  {
    Icon: MoneyCollectOutlined,
    text: "财务管理",
    path: "/finance",
    clickable: false,
    children: [
      {
        Icon: PlusSquareOutlined,
        text: "账户充值",
        path: "/finance/payAccount",
      },
      {
        Icon: BookOutlined,
        text: "充值记录",
        path: "/finance/payments",
      },
    ],
  },
];

export const tenantAdminRoutes: NavItemProps[] = [
  {
    Icon: CloudServerOutlined,
    text: "租户管理",
    path: "/admin",
    clickToPath: "/admin/info",
    children: [
      {
        Icon: InfoOutlined,
        text: "租户信息",
        path: "/admin/info",
      },
      {
        Icon: BookOutlined,
        text: "运行中的作业",
        path: "/admin/runningJobs",
      },
      {
        Icon: BookOutlined,
        text: "已结束的作业",
        path: "/admin/historyJobs",
      },
      {
        Icon: UserOutlined,
        text: "用户管理",
        path: "/admin/users",
        clickToPath: "/admin/users/list",
        children: [
          {
            Icon: UserOutlined,
            text: "用户列表",
            path: "/admin/users/list",
          },
          ...publicConfig.ENABLE_CREATE_USER ? [{
            Icon: UserAddOutlined,
            text: "创建用户",
            path: "/admin/users/create",
          }] : [],
        ],
      },
      {
        Icon: ClockCircleOutlined,
        text: "调整作业时间限制",
        path: "/admin/jobTimeLimit",
      },
      // {
      //   Icon: CloudOutlined,
      //   text: "调整用户存储空间",
      //   path: "/admin/storage",
      // },
      {
        Icon: AccountBookOutlined,
        text: "账户管理",
        path: "/admin/accounts",
        clickToPath: "/admin/accounts/list",
        children: [
          {
            Icon: AccountBookOutlined,
            text: "账户列表",
            path: "/admin/accounts/list",
          },
          {
            Icon: PlusOutlined,
            text: "创建账户",
            path: "/admin/accounts/create",
          },
          {
            Icon: <AntdIcon component={Whitelist} />,
            text: "账户白名单",
            path: "/admin/accounts/whitelist",
          },
        ],
      },
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
    clickToPath: "/user/runningJobs",
    children: [
      ...accounts.length > 0 ? [
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
      ] : [],
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

  if (user.tenantRoles.includes(TenantRole.TENANT_FINANCE)) {
    routes.push(...tenantFinanceRoutes);
  }

  if (user.tenantRoles.includes(TenantRole.TENANT_ADMIN)) {
    routes.push(...tenantAdminRoutes);
  }


  return routes;
};

export const iconToNode = (Icon: any) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon />;
};
