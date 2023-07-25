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
  InfoOutlined, LinkOutlined, LockOutlined, MoneyCollectOutlined, PartitionOutlined,
  PlusOutlined, PlusSquareOutlined, StarOutlined, ToolOutlined, UserAddOutlined,
  UserOutlined } from "@ant-design/icons";
import { NavItemProps } from "@scow/lib-web/build/layouts/base/types";
import { NavIcon } from "@scow/lib-web/build/layouts/icon";
import { AccountAffiliation } from "@scow/protos/build/server/user";
import { join } from "path";
import { PlatformRole, TenantRole, UserRole } from "src/models/User";
import { User } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";
import { createUserParams, useBuiltinCreateUser } from "src/utils/createUser";

export const platformAdminRoutes: (platformRoles: PlatformRole[]) => NavItemProps[] = (platformRoles) => [
  {
    Icon: UserOutlined,
    text: "平台管理",
    path: "/admin",
    clickToPath: "/admin/info",
    children: [
      {
        Icon: InfoOutlined,
        text: "平台信息",
        path: "/admin/info",
      },
      ...(platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ? [
        {
          Icon: UserOutlined,
          text: "导入用户",
          path: "/admin/importUsers",
        },
        {
          Icon: CloudServerOutlined,
          text: "平台租户管理",
          path: "/admin/tenants",
          clickToPath: "/admin/tenants/list",
          children: [
            {
              Icon: UserOutlined,
              text: "平台租户列表",
              path: "/admin/tenants/list",
            },
            {
              Icon: PlusOutlined,
              text: "创建租户",
              path: "/admin/tenants/create",
            },
          ],
        },
        {
          Icon: UserOutlined,
          text: "平台用户列表",
          path: "/admin/users",
        },
        {
          Icon: MoneyCollectOutlined,
          text: "作业计费价格表",
          path: "/admin/jobBilling",
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
      {
        Icon: ToolOutlined,
        text: "平台调试",
        path: "/admin/systemDebug",
        clickable: false,
        children: [
          {
            Icon: LockOutlined,
            text: "封锁状态同步",
            path: "/admin/systemDebug/slurmBlockStatus",
          },
          {
            Icon: BookOutlined,
            text: "作业信息同步",
            path: "/admin/systemDebug/fetchJobs",
          },
        ],
      },

    ],
  },
];

export const tenantRoutes: (tenantRoles: TenantRole[], token: string) => NavItemProps[] = (tenantRoles, token) => [
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
          text: "未结束的作业",
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
            ...(useBuiltinCreateUser() ? [{
              Icon: UserAddOutlined,
              text: "创建用户",
              path: "/tenant/users/create",
            }] : []),
            ...((
              publicConfig.CREATE_USER_CONFIG.misConfig.enabled &&
              publicConfig.CREATE_USER_CONFIG.misConfig.type === "external"
            ) ? [{
                Icon: UserAddOutlined,
                text: "创建用户",
                path: publicConfig.CREATE_USER_CONFIG.misConfig.external!.url + "?" + createUserParams(token),
                openInNewPage: true,
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
              Icon: StarOutlined,
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

export const customNavLinkRoutes = (navLinkItems: NavItemProps[]): NavItemProps[] => {
  return navLinkItems;
};

export const getAvailableRoutes = (user: User | undefined): NavItemProps[] => {

  if (!user) { return []; }

  const routes = [] as NavItemProps[];

  routes.push(...userRoutes(user.accountAffiliations));

  const adminAccounts = user.accountAffiliations.filter((x) => x.role !== UserRole.USER);
  if (adminAccounts.length > 0) {
    routes.push(...accountAdminRoutes(adminAccounts));
  }

  if (user.tenantRoles.length !== 0) {
    routes.push(...tenantRoutes(user.tenantRoles, user.token));
  }

  if (user.platformRoles.length !== 0) {
    routes.push(...platformAdminRoutes(user.platformRoles));
  }

  // 获取当前用户角色
  const userCurrentRoles = getCurrentUserRoles(user);

  // 根据配置文件判断是否增加导航链接
  if (publicConfig.NAV_LINKS && publicConfig.NAV_LINKS.length > 0) {

    const mappedNavLinkItems = publicConfig.NAV_LINKS
      .filter((link) => !link.allowedRoles
        || (link.allowedRoles.length && link.allowedRoles.some((role) => userCurrentRoles[role])))
      .map((link) => {
        const childrenLinks = link.children?.filter((childLink) => !childLink.allowedRoles
          || (childLink.allowedRoles.length &&
            childLink.allowedRoles.some((role) => userCurrentRoles[role])))
          .map((childLink) => ({
            Icon: !childLink.iconPath ? LinkOutlined : (
              <NavIcon
                src={join(publicConfig.PUBLIC_PATH, childLink.iconPath)}
              />
            ),
            text: childLink.text,
            path: `${childLink.url}?token=${user.token}`,
            clickToPath: `${childLink.url}?token=${user.token}`,
            openInNewPage: childLink.openInNewPage,
          }) as NavItemProps);

        const parentNavPath = link.url ? `${link.url}?token=${user.token}`
          : (childrenLinks && childrenLinks.length > 0 ? childrenLinks[0].path : "");

        return {
          Icon: !link.iconPath ? LinkOutlined : (
            <NavIcon
              src={join(publicConfig.PUBLIC_PATH, link.iconPath)}
            />
          ),
          text: link.text,
          path: parentNavPath,
          clickToPath: parentNavPath,
          openInNewPage: link.openInNewPage,
          children: childrenLinks,
        };
      }) as NavItemProps[];


    routes.push(...customNavLinkRoutes(mappedNavLinkItems));
  }

  return routes;
};

const getCurrentUserRoles = (user: User) => {
  return {
    user: user.accountAffiliations.length === 0,
    accountUser: user.accountAffiliations.length > 0
      && user.accountAffiliations.every((affiliation) => affiliation.role === UserRole.USER),
    accountAdmin: user.accountAffiliations.some((affiliation) => affiliation.role === UserRole.ADMIN),
    accountOwner: user.accountAffiliations.some((affiliation) => affiliation.role === UserRole.OWNER),
    platformAdmin: user.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
    platformFinance: user.platformRoles.includes(PlatformRole.PLATFORM_FINANCE),
    tenantAdmin: user.tenantRoles.includes(TenantRole.TENANT_ADMIN),
    tenantFinance: user.tenantRoles.includes(TenantRole.TENANT_FINANCE),
  };

};
