import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { moneyToNumber } from "@scow/lib-decimal";
import { Divider } from "antd";
import { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useStore } from "simstate";
import { mockApi } from "src/apis/api.mock";
import { USE_MOCK } from "src/apis/useMock";
import { requireAuth } from "src/auth/requireAuth";
import { AuthResultError, ssrAuthenticate } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { AccountStatus } from "src/generated/server/user";
import { AccountInfoSection } from "src/pageComponents/dashboard/AccountInfoSection";
import { JobsSection } from "src/pageComponents/dashboard/JobsSection";
import { getUserStatus, GetUserStatusSchema } from "src/pages/api/dashboard/status";
import { UserStore } from "src/stores/UserStore";
import { Head } from "src/utils/head";

export type AccountInfo = Omit<AccountStatus, "balance"> & {
  balance: number;
}

type Props = {
  error: AuthResultError;
} | {
  storageQuotas: GetUserStatusSchema["responses"]["200"]["storageQuotas"],
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
      {/* <StorageSection storageQuotas={storageQuotas} /> */}
      <Divider />
      <JobsSection user={userStore.user!} />
    </div>
  );
});


export const getServerSideProps: GetServerSideProps<Props> = async ({ req }) => {
  const auth = ssrAuthenticate((i) => i.accountAffiliations.length > 0);

  // Cannot directly call api routes here, so mock is not available directly.
  // manually call mock
  if (USE_MOCK) {

    const status = await mockApi.getUserStatus();

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
