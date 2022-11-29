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
