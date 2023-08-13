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
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { parseCookies } from "nookies";
import { requireAuth } from "src/auth/requireAuth";
import { SSRProps } from "src/auth/server";
import { PageTitle } from "src/components/PageTitle";
import { JobTable } from "src/pageComponents/job/HistoryJobTable";
import { Head } from "src/utils/head";

type Props = SSRProps<{}>;

export const JobsPage: NextPage = requireAuth((u) => u.accountAffiliations.length > 0)(
  ({ userStore }) => {
    return (
      <div>
        <Head title="历史作业" />
        <PageTitle titleText={"本用户已结束的作业"} />
        <JobTable
          accountNames={userStore.user.accountAffiliations.map((x) => x.accountName)}
          userId={userStore.user.identityId}
          showAccount={true}
          showUser={false}
          filterUser={false}
          showedPrices={["account"]}
          priceTexts={{ account: "作业计费" }}
        />
      </div>
    );

  });

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {

  const cookies = parseCookies({ req });
  const locale = cookies.language || "zh_cn";
  const lngProps = await serverSideTranslations(locale ?? "zh_cn");
  return {
    props: {
      ...lngProps,
    },
  };
};

export default JobsPage;
