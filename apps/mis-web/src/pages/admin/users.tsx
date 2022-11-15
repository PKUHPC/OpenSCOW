import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { AllUsersTable } from "src/pageComponents/admin/AllUsersTable";
import { Head } from "src/utils/head";
import { RefreshLink, useRefreshToken } from "src/utils/refreshToken";


export const ShowUsersPage: NextPage = 
  requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(({ userStore: { user } }) => {
    
    const [refreshToken, update] = useRefreshToken();

    return (
      <div>
        <Head title="平台用户列表" />
        <PageTitle titleText={"平台用户列表"}>
          <RefreshLink refresh={update} />
        </PageTitle>
        <AllUsersTable 
          refreshToken={refreshToken}
          user={user}
        />
      </div>
    );
  });

export default ShowUsersPage;