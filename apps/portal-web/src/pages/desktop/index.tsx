import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { PageTitle } from "src/components/PageTitle";
import { DesktopTable } from "src/pageComponents/desktop/DesktopTable";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const DesktopIndexPage: NextPage = requireAuth(() => true)(() => {

  if (!publicConfig.ENABLE_LOGIN_DESKTOP) {
    return <NotFoundPage />;
  }

  return (
    <div>
      <Head title="桌面" />
      <PageTitle titleText="登录节点上的桌面" />
      <DesktopTable />
    </div>
  );
});

export default DesktopIndexPage;
