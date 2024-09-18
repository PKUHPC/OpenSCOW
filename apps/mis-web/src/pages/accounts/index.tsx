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

import { GetServerSideProps, NextPage } from "next";
import { AuthResultError, ssrAuthenticate } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { Redirect } from "src/components/Redirect";
import { useI18nTranslateToString } from "src/i18n";
import { accountAdminRoutes } from "src/layouts/routes";
import { AccountAffiliation, UserRole } from "src/models/User";

interface Props {
  error: AuthResultError;
  adminAccounts?: AccountAffiliation[]
}

export const FinanceIndexPage: NextPage<Props> = ({ error, adminAccounts }) => {

  const t = useI18nTranslateToString();

  if (error) {
    return <UnifiedErrorPage code={error} />;
  }
  if (adminAccounts) {
    return (
      <Redirect url={accountAdminRoutes(adminAccounts, t)[0].children![0].children![0].path} />
    );
  }

};

const auth = ssrAuthenticate((u) => u.accountAffiliations.some((x) => x.role !== UserRole.USER));

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  const info = await auth(ctx.req);

  if (typeof info === "number") { return { props: { error: info } }; }

  const adminAccounts = info.accountAffiliations.filter((x) => x.role !== UserRole.USER);

  return { props: { adminAccounts } };

};

export default FinanceIndexPage;
