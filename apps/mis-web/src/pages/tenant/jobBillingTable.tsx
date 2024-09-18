/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
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
import { useStore } from "simstate";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { TenantRole } from "src/models/User";
import { ManageJobBillingTable } from "src/pageComponents/job/ManageJobBillingTable";
import { ClusterInfoStore } from "src/stores/ClusterInfoStore";
import { Head } from "src/utils/head";

const p = prefix("page.tenant.jobBillingTable.");

export const TenantAdminJobBillingTablePage: NextPage = requireAuth(
  (x) => x.tenantRoles.includes(TenantRole.TENANT_ADMIN),
)(
  ({ userStore }) => {

    const tenant = userStore.user.tenant;

    const t = useI18nTranslateToString();
    const { clusterSortedIdList, activatedClusters } = useStore(ClusterInfoStore);
    const currentActivatedClusterIds = Object.keys(activatedClusters);

    const { data, isLoading, reload } = useAsync({ promiseFn: useCallback(async () => {
      return await api.getBillingItems({
        query: { tenant: tenant, activeOnly: false, currentActivatedClusterIds, clusterSortedIdList } });
    }, [userStore.user]) });

    return (
      <div>
        <Head title={t(p("manageTenantJobPriceTable"))} />
        <PageTitle titleText={`${t("common.tenant")}${tenant}${t("common.jobBillingTable")}`} reload={reload} />
        { currentActivatedClusterIds.length === 0 &&
        <div style={{ marginBottom: 20 }}>{t("common.noAvailableClusters")}</div>
        }
        <ManageJobBillingTable tenant={tenant} reload={reload} data={data} loading={isLoading} />
      </div>
    );
  });

export default TenantAdminJobBillingTablePage;

