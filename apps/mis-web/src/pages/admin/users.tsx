import { NextPage } from "next";
import { PageTitle } from "src/components/PageTitle";
import { AllUsersTable } from "src/pageComponents/admin/AllUsersTable";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";


export const ShowUsersPage: NextPage = () => {
    
  const [refreshToken, update] = useRefreshToken();

  return (
    <div>
      <Head title="平台用户列表" />
      <PageTitle titleText={"平台用户列表"} >
        <RefreshLink refresh={update} />
      </PageTitle>
      <AllUsersTable refreshToken={refreshToken}/>
    </div>
  );
};

export default ShowUsersPage;