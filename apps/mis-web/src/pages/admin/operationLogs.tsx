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
import { OperationLogTable } from "src/components/OperationLogTable";
import { PageTitle } from "src/components/PageTitle";
import { prefix, useI18nTranslateToString } from "src/i18n";
import { OperationLogQueryType } from "src/models/operationLog";
import { PlatformRole } from "src/models/User";
import { Head } from "src/utils/head";

const p = prefix("page.admin.operationLogs.");

export const OperationLogPage: NextPage = requireAuth(
  (u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN),
)(
  ({ userStore }) => {
    const t = useI18nTranslateToString();
    const title = t(p("platformOperationLog"));
    return (
      <div>
        <Head title={t("common.operationLog")} />
        <PageTitle titleText={title} />
        <OperationLogTable queryType={OperationLogQueryType.PLATFORM} user={userStore.user} />
      </div>
    );

  });

export default OperationLogPage;
