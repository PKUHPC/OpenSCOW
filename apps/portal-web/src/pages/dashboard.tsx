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
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { CustomizableLogoAndText } from "src/pageComponents/dashboard/CustomizableLogoAndText";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";
import { getHostname } from "src/utils/host";

interface Props { 
  hostname: string | undefined
}

export const DashboardPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  return (
    <div>
      <Head title="仪表盘" />

      <CustomizableLogoAndText hostname={props.hostname} />
    </div>
  );
});

export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
 
  const hostname = getHostname(req);

  return {
    props: {
      hostname,
    },
  };
};


export default DashboardPage;
