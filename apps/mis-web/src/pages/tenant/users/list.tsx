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

import { RefreshLink, useRefreshToken } from "@scow/lib-web/build/utils/refreshToken";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { AdminUserTable } from "src/pageComponents/tenant/AdminUserTable";
import { Head } from "src/utils/head";

export const AdminUsersPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  ({ userStore: { user } }) => {

    const promiseFn = useCallback(async () => {
      return await api.getTenantUsers({ });
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title="用户列表" />
        <PageTitle titleText={"用户列表"}>
          <RefreshLink refresh={update} />
        </PageTitle>
        <AdminUserTable
          data={data}
          isLoading={isLoading}
          reload={reload}
          user={user}
        />
      </div>
    );

  });

export default AdminUsersPage;
