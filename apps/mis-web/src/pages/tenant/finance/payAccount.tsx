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

import { FormLayout } from "@scow/lib-web/build/layouts/FormLayout";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { TenantRole } from "src/models/User";
import { ChargeForm } from "src/pageComponents/finance/ChargeForm";
import { Head } from "src/utils/head";

const p = prefix("page.tenant.finance.payAccount.");

export const FinancePayPage: NextPage = requireAuth((i) => i.tenantRoles.includes(TenantRole.TENANT_FINANCE) ||
  i.tenantRoles.includes(TenantRole.TENANT_ADMIN))(
  () => {
    const t = useI18nTranslateToString();

    return (
      <div>
        <Head title={t(p("title"))} />
        <PageTitle titleText={t(p("title"))} />
        <FormLayout>
          <ChargeForm />
        </FormLayout>
      </div>
    );
  });

export default FinancePayPage;
