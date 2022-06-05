import { AppServer } from "@scow/config/build/appConfig/appServer";
import { GetServerSideProps, NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { SSRProps } from "src/auth/server";
import { UnifiedErrorPage } from "src/components/errorPages/UnifiedErrorPage";
import { PageTitle } from "src/components/PageTitle";
import { LaunchAppForm } from "src/pageComponents/app/LaunchAppForm";
import { runtimeConfig } from "src/utils/config";
import { Head } from "src/utils/head";
import { queryToString } from "src/utils/querystring";

type Props = SSRProps<{
  config: AppServer;
}, 400 | 404>;

export const AppIndexPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { config } = props;

  return (
    <div>
      <Head title={`启动${config.name}`} />
      <PageTitle titleText={`启动${config.name}`} />
      <LaunchAppForm config={config} />
    </div>
  );
});

const appsMap = runtimeConfig.APPS.reduce((prev, curr) => {
  prev[curr.id] = curr;
  return prev;
}, {} as Record<string, AppServer>);

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {

  const appId = queryToString(query.app);

  if (!appId) { return { props: { error: 400 } }; }

  const config = appsMap[appId];

  if (!config) { return { props: { error: 404 } };}

  return {
    props: {
      config,
    },
  };
};



export default AppIndexPage;

