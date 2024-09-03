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

import { PlatformRole,TenantRole, UserInfo, UserRole } from "src/models/user";


export const MOCK_USER_INFO = {
  tenant: "default",
  name: "demo_admin",
  identityId: "demo_admin",
  token: "demo_admin",
  tenantRoles: [TenantRole.TENANT_ADMIN],
  platformRoles: [PlatformRole.PLATFORM_ADMIN],
  accountAffiliations: [
    { accountName: "demo_admin", role: UserRole.ADMIN },
    { accountName: "hpc2001213075", role: UserRole.USER },
  ],
  createTime:"2023-08-03T03:47:23.485Z",
} as UserInfo;
