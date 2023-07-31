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
import { OperationLogQueryType } from "src/models/operationLogModal";
import {
  checkQueryAccountNameIsAdmin,
  useAccountPagesAccountName } from "src/pageComponents/accounts/checkQueryAccountNameIsAdmin";
import { OperationLogTable } from "src/pageComponents/operationLog/OperationLogTable";
import { Head } from "src/utils/head";

export const OperationLogPage: NextPage = requireAuth(
  (u) => u.accountAffiliations.length > 0,
  checkQueryAccountNameIsAdmin)(
  ({ userStore }) => {
    const accountName = useAccountPagesAccountName();

    const title = `账户${accountName}操作日志`;
    return (
      <div>
        <Head title="操作日志" />
        <PageTitle titleText={title} />
        <OperationLogTable queryType={OperationLogQueryType.ACCOUNT} user={userStore.user} accountName={accountName} />
      </div>
    );

  });

export default OperationLogPage;
