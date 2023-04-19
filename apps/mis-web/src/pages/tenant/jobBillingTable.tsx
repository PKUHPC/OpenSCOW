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

import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { TenantRole } from "src/models/User";
import { ManageJobBillingTable } from "src/pageComponents/job/ManageJobBillingTable";
import { Head } from "src/utils/head";

export const TenantAdminJobBillingTablePage: NextPage = requireAuth(
  (x) => x.tenantRoles.includes(TenantRole.TENANT_ADMIN),
)(
  ({ userStore }) => {

    const tenant = userStore.user.tenant;

    const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
      return await api.getBillingItems({ query: { tenant: tenant, activeOnly: false } });
    }, [userStore.user]) });

    return (
      <div>
        <Head title="管理本租户作业价格表" />
        <PageTitle titleText={`管理租户${tenant}作业价格表`} reload={reload} />
        <ManageJobBillingTable tenant={tenant} reload={reload} data={data} loading={isLoading} />
      </div>
    );
  });

export default TenantAdminJobBillingTablePage;

