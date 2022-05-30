import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { AppSessionsTable } from "src/pageComponents/desktop/AppSessionsTable";
import { Head } from "src/utils/head";

export const SessionsIndexPage: NextPage = requireAuth(() => true)(() => {

  return (
    <div>
      <Head title="交互式应用" />
      <AppSessionsTable />
    </div>
  );
});

export default SessionsIndexPage;
