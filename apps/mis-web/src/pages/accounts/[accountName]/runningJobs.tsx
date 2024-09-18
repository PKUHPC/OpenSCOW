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
import { prefix, useI18nTranslate, useI18nTranslateToString } from "src/i18n";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { RunningJobQueryTable } from "src/pageComponents/job/RunningJobTable";
import { Head } from "src/utils/head";

const p = prefix("page.accounts.accountName.runningJobs.");

export const RunningJobsPage: NextPage = requireAuth(
  (u) => u.accountAffiliations.length > 0,
  checkQueryAccountNameIsAdmin,
)(
  () => {
    const t = useI18nTranslateToString();
    const tArgs = useI18nTranslate();

    const accountName = useAccountPagesAccountName();
    const title = t(p("title"), [accountName]);
    const pageTitle = tArgs(p("title"), [accountName]);

    return (
      <div>
        <Head title={title} />
        <PageTitle titleText={pageTitle} />
        <RunningJobQueryTable
          accountNames={accountName}
          showAccount={false}
          filterAccountName={false}
          showUser={true}
        />
      </div>

    );

  });

export default RunningJobsPage;
