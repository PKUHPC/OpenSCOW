import { NextPage } from "next";
import { useRouter } from "next/router";
import { useStore } from "simstate";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { LaunchAppForm } from "src/pageComponents/app/LaunchAppForm";
import { AppsStore } from "src/stores/AppsStore";
import { Head } from "src/utils/head";
import { queryToString } from "src/utils/querystring";


export const AppIndexPage: NextPage = requireAuth(() => true)(() => {

  const router = useRouter();
  const appId = queryToString(router.query.app);

  const apps = useStore(AppsStore);

  const app = apps.find((x) => x.id === appId);

  if (!app) {
    return (
      <NotFoundPage />
    );
  }

  return (
    <div>
      <Head title={`启动${app.name}`} />
      <PageTitle titleText={`启动${app.name}`} />
      <LaunchAppForm appId={appId} />
    </div>
  );
});

export default AppIndexPage;

