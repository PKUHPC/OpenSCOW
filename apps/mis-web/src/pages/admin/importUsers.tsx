import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { ImportUsersTable } from "src/pageComponents/admin/ImportUsersTable";
import { Head } from "src/utils/head";


export const ImportUsersPage: NextPage = requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(
  () => {
    return (
      <div>
        <Head title="导入用户信息" />
        <PageTitle titleText={"导入用户信息"} />
        <ImportUsersTable />

      </div>
    );
  });

export default ImportUsersPage;

