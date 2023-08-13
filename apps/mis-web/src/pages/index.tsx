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
import { useStore } from "simstate";
import { SSRProps } from "src/auth/server";
import { Redirect } from "src/components/Redirect";
import { UserStore } from "src/stores/UserStore";

import { loadAppCustomTranslation } from "./_app";

type Props = SSRProps<{}>;

export const IndexPage: NextPage = () => {

  const userStore = useStore(UserStore);

  if (userStore.user) {
    if (
      userStore.user.platformRoles.length === 0 &&
      userStore.user.tenantRoles.length === 0 &&
      userStore.user.accountAffiliations.length === 0
    ) {
      return <Redirect url="/noAccount" />;
    } else {
      return <Redirect url="/dashboard" />;
    }
  } else {
    return <Redirect url="/api/auth" />;
  }

};

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {

  const cookies = parseCookies({ req });
  const locale = cookies.language || "zh_cn";

  // serverSideTranslation加入用户配置文本,可以为当前页使用的单独文本
  const lngProps = await serverSideTranslations(locale ?? "zh_cn");
  return {
    props: {
      ...lngProps,
    },
  };
};

export default IndexPage;
