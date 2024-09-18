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

import { RefreshLink, useRefreshToken } from "@scow/lib-web/build/utils/refreshToken";
import { Divider, Space } from "antd";
import { NextPage } from "next";
import { useCallback } from "react";
import { useAsync } from "react-async";
import { api } from "src/apis";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18n, useI18nTranslateToString } from "src/i18n";
import { TenantRole } from "src/models/User";
import { AccountWhitelistTable } from "src/pageComponents/tenant/AccountWhitelistTable";
import { AddWhitelistedAccountButton } from "src/pageComponents/tenant/AddWhitelistedAccountButton";
import { Head } from "src/utils/head";

const p = prefix("page.tenant.accounts.whitelist.");

export const AccountWhitelistPage: NextPage = requireAuth((u) => u.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {

    const t = useI18nTranslateToString();
    const languageId = useI18n().currentLanguage.id;

    const promiseFn = useCallback(async () => {
      return await api.getWhitelistedAccounts({});
    }, []);

    const [refreshToken, update] = useRefreshToken();

    const { data, isLoading, reload } = useAsync({ promiseFn, watch: refreshToken });

    return (
      <div>
        <Head title={t(p("title"))} />
        <PageTitle titleText={t(p("whitelistAccountList"))}>
          <Space split={<Divider type="vertical" />}>
            <AddWhitelistedAccountButton refresh={reload} />
            <RefreshLink refresh={update} languageId={languageId} />
          </Space>
        </PageTitle>
        <AccountWhitelistTable
          data={data}
          isLoading={isLoading}
          reload={reload}
        />
      </div>
    );

  });

export default AccountWhitelistPage;
