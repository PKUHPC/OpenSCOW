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

import React, { useEffect } from "react";
import { useStore } from "simstate";
import { UserStore } from "src/stores/UserStore";

import { ForbiddenPage } from "./ForbiddenPage";
import { NotAuthorizedPage } from "./NotAuthorizedPage";
import { NotFoundPage } from "./NotFoundPage";
import { ServerErrorPage } from "./ServerErrorPage";

interface Props {
  code: number;
  customComponents?: { [code: number]: React.ReactElement };
}

export const UnifiedErrorPage: React.FC<Props> = ({
  code,
  customComponents = {},
}) => {

  const userStore = useStore(UserStore);

  useEffect(() => {
    if (code === 401) {
      userStore.logout();
    }
  }, []);

  switch (code) {
  case 401:
    return customComponents[401] ?? <NotAuthorizedPage />;
  case 403:
    return customComponents[403] ?? <ForbiddenPage />;
  case 404:
    return customComponents[404] ?? <NotFoundPage />;
  default:
    return customComponents[code] ?? <ServerErrorPage />;
  }
};
