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

import { moneyToNumber } from "@scow/lib-decimal";
import { AccountStatus } from "@scow/protos/build/server/user";
import { Divider } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { MOCK_USER_STATUS } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { requireAuth } from "src/auth/requireAuth";
import { AuthResultError, ssrAuthenticate } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { AccountInfoSection } from "src/pageComponents/dashboard/AccountInfoSection";
import { JobsSection } from "src/pageComponents/dashboard/JobsSection";
import { StorageSection } from "src/pageComponents/dashboard/StorageSection";
import { getUserStatus, GetUserStatusSchema } from "src/pages/api/dashboard/status";
import { UserStore } from "src/stores/UserStore";
import { ensureNotUndefined } from "src/utils/checkNull";
import { Head } from "src/utils/head";

export type AccountInfo = Omit<AccountStatus, "balance"> & {
  balance: number;
}

type Props = {
  error: AuthResultError;
} | {
  storageQuotas: typeof GetUserStatusSchema["responses"]["200"]["storageQuotas"],
  accounts: Record<string, AccountInfo>;
};

export const DashboardPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  const userStore = useStore(UserStore);
  const router = useRouter();

  useEffect(() => {
    router.replace(router.asPath);
  }, [userStore.user]);

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { accounts } = props;

  return (
    <div>
      <Head title="仪表盘" />
      <AccountInfoSection info={accounts} />
      {/* <Divider /> */}
      <StorageSection storageQuotas={props.storageQuotas} />
      <Divider />
      <JobsSection user={userStore.user!} />
    </div>
  );
});


export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const auth = ssrAuthenticate(() => true);

  // Cannot directly call api routes here, so mock is not available directly.
  // manually call mock
  if (USE_MOCK) {

    const status = MOCK_USER_STATUS;

    const accountInfo = Object.keys(status.accountStatuses).reduce((prev, curr) => {
      prev[curr] = { ...status.accountStatuses[curr], balance: 10.00 };
      return prev;
    }, {} as Record<number, AccountInfo>);

    return {
      props: {
        accounts: accountInfo,
        storageQuotas: status.storageQuotas,
      },
    };
  }

  const info = await auth(req);

  if (typeof info === "number") { return { props: { error: info } }; }

  const status = await getUserStatus(info.identityId, info.tenant);

  const accounts = Object.entries(status.accountStatuses).reduce((prev, [accountName, info]) => {

    const { balance, ...validated } = ensureNotUndefined(info, ["balance"]);

    prev[accountName] = {
      ...validated,
      balance: moneyToNumber(balance),
    };
    return prev;
  }, {} as Record<string, AccountInfo>);

  return {
    props: {
      accounts,
      storageQuotas: status.storageQuotas,
    },
  };
};

export default DashboardPage;
