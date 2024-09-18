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
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { UserRole } from "src/models/User";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { PaymentTable, SearchType } from "src/pageComponents/common/PaymentTable";
import { Head } from "src/utils/head";

const p = prefix("page.accounts.accountName.payments.");

export const PaymentsPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
  checkQueryAccountNameIsAdmin,
)(() => {
  const t = useI18nTranslateToString();

  const accountName = useAccountPagesAccountName();
  const title = t(p("title"), [accountName]);

  return (
    <div>
      <Head title={title} />
      <PageTitle titleText={title} />
      <PaymentTable
        searchType={SearchType.selfAccount}
        accountNames={[accountName]}
      />
    </div>
  );
});

export default PaymentsPage;
