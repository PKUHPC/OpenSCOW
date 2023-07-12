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

import { DatabaseOutlined } from "@ant-design/icons";
import { BaseLayout as LibBaseLayout } from "@scow/lib-web/build/layouts/base/BaseLayout";
import { JumpToAnotherLink } from "@scow/lib-web/build/layouts/base/header/components";
import { PropsWithChildren, useMemo } from "react";
import { useStore } from "simstate";
import { DefaultClusterSelector } from "src/layouts/DefaultClusterSelector";
import { userRoutes } from "src/layouts/routes";
import { DefaultClusterStore } from "src/stores/DefaultClusterStore";
import { LoginNodeStore } from "src/stores/LoginNodeStore";
import { UserStore } from "src/stores/UserStore";
import { publicConfig } from "src/utils/config";

interface Props {
  footerText: string;
  versionTag: string | undefined;
}

export const BaseLayout = ({ footerText, versionTag, children }: PropsWithChildren<Props>) => {

  const userStore = useStore(UserStore);
  const defaultClusterStore = useStore(DefaultClusterStore);
  const loginNodes = useStore(LoginNodeStore);

  const routes = useMemo(() => userRoutes(
    userStore.user, defaultClusterStore.cluster, loginNodes,
  ), [userStore.user, defaultClusterStore.cluster]);

  return (
    <LibBaseLayout
      logout={userStore.logout}
      user={userStore.user}
      routes={routes}
      footerText={footerText}
      versionTag={versionTag}
      basePath={publicConfig.BASE_PATH}
      headerRightContent={(
        <>
          <DefaultClusterSelector />
          <JumpToAnotherLink
            user={userStore.user}
            icon={<DatabaseOutlined style={{ paddingRight: 2 }} />}
            link={publicConfig.MIS_URL}
            linkText="管理系统"
          />
        </>
      )}
    >
      {children}
    </LibBaseLayout>
  );
};
