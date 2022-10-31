import { NextPage } from "next";
import { PageTitle } from "src/components/PageTitle";
import { ImportUsersTable } from "src/pageComponents/admin/ImportUsersTable";
import { Head } from "src/utils/head";


export const ImportUsersPage: NextPage = () => {
  return (
    <div>
      <Head title="导入用户信息" />
      <PageTitle titleText={"导入用户信息"} />
      <ImportUsersTable />

    </div>
  );
};

export default ImportUsersPage;

