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
import { PlatformRole } from "src/models/User";
import { TenantChargeForm } from "src/pageComponents/admin/TenantChargeForm";
import { Head } from "src/utils/head";

const p = prefix("page.admin.finance.pay.");

export const TenantFinancePayPage: NextPage = requireAuth(
  (i) => i.platformRoles.includes(PlatformRole.PLATFORM_FINANCE) ||
      i.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    const t = useI18nTranslateToString();

    return (
      <div>
        <Head title={t(p("tenantCharge"))} />
        <PageTitle titleText={t(p("tenantCharge"))} />
        <FormLayout>
          <TenantChargeForm />
        </FormLayout>
      </div>
    );
  });

export default TenantFinancePayPage;
