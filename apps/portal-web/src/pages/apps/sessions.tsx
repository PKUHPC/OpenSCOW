import { AppServer } from "@scow/config/build/appConfig/appServer";
import { GetServerSideProps, NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { AppSessionsTable } from "src/pageComponents/app/AppSessionsTable";
import { runtimeConfig } from "src/utils/config";
import { Head } from "src/utils/head";

type Props = SSRProps<{
  connectProps: Record<string, AppServer["connect"]>;
}>;

export const SessionsIndexPage: NextPage = requireAuth(() => true)((props: Props) => {

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  return (
    <div>
      <Head title="交互式应用" />
      <PageTitle titleText="交互式应用" />
      <AppSessionsTable connectProps={props.connectProps} />
    </div>
  );
});

const connectProps = runtimeConfig.APPS.reduce((prev, curr) => {
  prev[curr.id] = curr.connect;
  return prev;
}, {} as Record<string, AppServer["connect"]>);

// Get all connect props
export const getServerSideProps: GetServerSideProps<Props> = async () => {

  return {
    props: {
      connectProps,
    },
  };
};

export default SessionsIndexPage;
