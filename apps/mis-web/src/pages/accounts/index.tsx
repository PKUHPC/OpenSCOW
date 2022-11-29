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

import { GetServerSideProps, NextPage } from "next";
import { AuthResultError, ssrAuthenticate } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { accountAdminRoutes } from "src/layouts/routes";
import { UserRole } from "src/models/User";

type Props = {
  error: AuthResultError;
};

export const FinanceIndexPage: NextPage<Props> = ({ error }) => {

  if (error) {
    return <UnifiedErrorPage code={error} />;
  }

  return (
    <></>
  );
};

const auth = ssrAuthenticate((u) => u.accountAffiliations.some((x) => x.role !== UserRole.USER));

export const getServerSideProps: GetServerSideProps = async (ctx) => {

  const info = await auth(ctx.req);

  if (typeof info === "number") { return { props: { error: info } }; }

  const adminAccounts = info.accountAffiliations.filter((x) => x.role !== UserRole.USER);

  return {
    redirect: {
      destination: accountAdminRoutes(adminAccounts)[0].children![0].children![0].path,
      permanent: false,
    },
  };
};

export default FinanceIndexPage;
