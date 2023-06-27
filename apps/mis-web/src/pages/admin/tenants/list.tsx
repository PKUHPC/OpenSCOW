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

import { RefreshLink, useRefreshToken } from "@scow/lib-web/build/utils/refreshToken";
import { Divider, Space } from "antd";
import { NextPage } from "next";
import { requireAuth } from "src/auth/requireAuth";
import { PageTitle } from "src/components/PageTitle";
import { PlatformRole } from "src/models/User";
import { AllTenantsTable } from "src/pageComponents/admin/AllTenantsTable";
import { Head } from "src/utils/head";


export const showAllTenants: NextPage =
  requireAuth((u) => u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN))(() => {

    const [refreshToken, update] = useRefreshToken();
    return (
      <div>
        <Head title="平台租户列表" />
        <PageTitle titleText={"平台租户列表"}>
          <Space split={<Divider type="vertical" />}>
            <RefreshLink refresh={update} />
          </Space>
        </PageTitle>
        <AllTenantsTable
          refreshToken={refreshToken}
        />
      </div>
    );
  });
export default showAllTenants;
