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
import { TenantRole } from "src/models/User";
import { PaymentTable } from "src/pageComponents/finance/PaymentTable";
import { Head } from "src/utils/head";

export const PaymentsPage: NextPage = requireAuth((i) =>
  i.tenantRoles.includes(TenantRole.TENANT_FINANCE),
)(() => {
  return (
    <div>
      <Head title="充值记录" />
      <PageTitle titleText="充值记录" />
      <PaymentTable
        showAccountName={true}
        showAuditInfo={true}
      />
    </div>
  );
});

export default PaymentsPage;
