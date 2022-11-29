/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

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