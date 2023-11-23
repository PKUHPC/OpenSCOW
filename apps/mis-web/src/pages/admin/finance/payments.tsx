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
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { PlatformRole } from "src/models/User";
import { PaymentTable, SearchType } from "src/pageComponents/common/PaymentTable";
import { Head } from "src/utils/head";

const p = prefix("page.admin.finance.payments.");

export const TenantPaymentsPage: NextPage = requireAuth((i) =>
  i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
  i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
)(() => {
  const t = useI18nTranslateToString();

  return (
    <div>
      <Head title={t(p("chargeRecord"))} />
      <PageTitle titleText={t(p("chargeRecord"))} />
      <PaymentTable
        searchType={SearchType.tenant}
      />
    </div>
  );
});

export default TenantPaymentsPage;
