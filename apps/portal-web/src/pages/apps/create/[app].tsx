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
  appId: string;
  appName: string;
}, 400 | 404>;

export const AppIndexPage: NextPage<Props> = requireAuth(() => true)((props: Props) => {

  if ("error" in props) {
    return <UnifiedErrorPage code={props.error} />;
  }

  const { appName, appId } = props;

  return (
    <div>
      <Head title={`启动${appName}`} />
      <PageTitle titleText={`启动${appName}`} />
      <LaunchAppForm appId={appId} />
    </div>
  );
});

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {

  const appId = queryToString(query.app);

  if (!appId) { return { props: { error: 400 } }; }

  const config = runtimeConfig.APPS[appId];

  if (!config) { return { props: { error: 404 } }; }

  return {
    props: {
      appId,
      appName: config.name,
    },
  };
};



export default AppIndexPage;

