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

import { queryToString, useQuerystring } from "@scow/lib-web/build/utils/querystring";
import { ForbiddenPage } from "src/components/errorPages/ForbiddenPage";
import { UserRole } from "src/models/User";
import type { User } from "src/stores/UserStore";

export const checkQueryAccountNameIsAdmin = (u: User) => {
  const query = useQuerystring();
  const accountName = queryToString(query.accountName);

  const account = u.accountAffiliations.find((x) => x.accountName === accountName);
  if (!account || account.role === UserRole.USER) {
    return <ForbiddenPage />;
  }
};

export const useAccountPagesAccountName = () => {
  const query = useQuerystring();
  const accountName = queryToString(query.accountName);

  return accountName;
};
