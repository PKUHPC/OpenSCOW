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
import { UserRole } from "src/models/User";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { PaymentTable } from "src/pageComponents/finance/PaymentTable";
import { Head } from "src/utils/head";

export const PaymentsPage: NextPage = requireAuth(
  (i) => i.accountAffiliations.some((x) => x.role !== UserRole.USER),
  checkQueryAccountNameIsAdmin,
)(() => {

  const accountName = useAccountPagesAccountName();
  const title = `账户${accountName}充值记录`;

  return (
    <div>
      <Head title={title} />
      <PageTitle titleText={title} />
      <PaymentTable
        accountNames={[accountName]}
        showAccountName={false}
        showAuditInfo={false}
      />
    </div>
  );
});

export default PaymentsPage;
