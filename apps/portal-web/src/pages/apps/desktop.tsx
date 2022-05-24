import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { NotFoundPage } from "src/components/errorPages/NotFoundPage";
import { DesktopTable } from "src/pageComponents/desktop/DesktopTable";
import { publicConfig } from "src/utils/config";
import { Head } from "src/utils/head";

export const DesktopIndexPage: NextPage = requireAuth(() => true)(() => {

  if (!publicConfig.ENABLE_VNC) {
    return <NotFoundPage />;
  }
  
  return (
    <div>
      <Head title="桌面" />
      <DesktopTable />
    </div>
  );
});

export default DesktopIndexPage;
