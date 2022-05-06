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
