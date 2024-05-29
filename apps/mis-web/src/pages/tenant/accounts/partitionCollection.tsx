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
import { Divider, Space } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { AssignmentState, testAvailablePartitions } from "src/models/cluster";
import { TenantRole } from "src/models/User";
import { AddToPartitionCollectionButton } from "src/pageComponents/partitions/AddToPartitionCollectionButton";
import { AvailablePartitionCollectionTable } from "src/pageComponents/partitions/AvailablePartitionCollectionTable";
import { Head } from "src/utils/head";

export const AccountPartitionCollection: NextPage = requireAuth((u) =>
  u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;

    const promiseFn = useCallback(async () => {
      // 获取可用分区集
      // return await api.getWhitelistedAccounts({});
      return testAvailablePartitions.filter((x) => (x.assignmentState === AssignmentState.ASSIGNED));
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title="账户可用分区集" />
        <PageTitle titleText="可用分区集">
          <Space split={<Divider type="vertical" />}>
            <AddToPartitionCollectionButton refresh={reload} />
            <RefreshLink refresh={update} languageId={languageId} />
          </Space>
        </PageTitle>
        <AvailablePartitionCollectionTable
          data={data}
          isLoading={isLoading}
          reload={reload}
        />
      </div>
    );

  });

export default AccountPartitionCollection;

