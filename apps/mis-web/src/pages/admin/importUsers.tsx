import { NextPage } from "next";
import { PageTitle } from "src/components/PageTitle";
import { ImportUsersForm } from "src/pageComponents/admin/ImportUsersForm";
import { Head } from "src/utils/head";

export const ImportUsersPage: NextPage = () => {
  return (
    <div>
      <Head title="导入用户信息" />
      <PageTitle titleText={"导入用户信息"} />
      <ImportUsersForm />
    </div>
  );
};

export default ImportUsersPage;
