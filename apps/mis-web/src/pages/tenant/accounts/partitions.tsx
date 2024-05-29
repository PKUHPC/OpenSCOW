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
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { useI18n, useI18nTranslateToString } from "src/i18n";
import { PartitionOperationType } from "src/models/cluster";
import { TenantRole } from "src/models/User";
import { PartitionManagementTable } from "src/pageComponents/partitions/PartitionManagementTable";
import { Head } from "src/utils/head";


export const AccountPartitionManagement: NextPage =
  requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(() => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;

    const [refreshToken, update] = useRefreshToken();
    return (
      <div>
        <Head title="账户可用分区" />
        <PageTitle titleText="可用分区">
          <Space split={<Divider type="vertical" />}>
            <RefreshLink refresh={update} languageId={languageId} />
          </Space>
        </PageTitle>
        <PartitionManagementTable
          refreshToken={refreshToken}
          operationType={PartitionOperationType.ACCOUNT_OPERATION}
        />
      </div>
    );
  });
export default AccountPartitionManagement;
