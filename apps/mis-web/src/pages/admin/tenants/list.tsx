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
import { PlatformRole } from "src/models/User";
import { AllTenantsTable } from "src/pageComponents/admin/AllTenantsTable";
import { Head } from "src/utils/head";


export const showAllTenants: NextPage =
  requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(() => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;

    const [refreshToken, update] = useRefreshToken();
    return (
      <div>
        <Head title={t("common.tenantList")} />
        <PageTitle titleText={t("common.tenantList")}>
          <Space split={<Divider type="vertical" />}>
            <RefreshLink refresh={update} languageId={languageId} />
          </Space>
        </PageTitle>
        <AllTenantsTable
          refreshToken={refreshToken}
        />
      </div>
    );
  });
export default showAllTenants;
