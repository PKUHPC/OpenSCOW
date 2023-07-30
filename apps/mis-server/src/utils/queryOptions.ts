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

import { SortDirection, UsersSortField } from "@scow/protos/build/server/user";

import { paginationProps } from "./orm";

// sort fields' text for mis pageComponent AllUsersTable
export const mapUsersSortField = {
  [UsersSortField.USER_ID]: "userId",
  [UsersSortField.NAME]: "name",
  [UsersSortField.CREATE_TIME]: "createTime",
};

// generate query options of all users
// with options: paginationProps, orderBy
export const generateAllUsersQueryOptions = (
  page: number,
  pageSize?: number,
  sortField?: UsersSortField,
  sortOrder?: SortDirection) => {
  return {
    ...paginationProps(page, pageSize || 10),
    orderBy: (sortField !== undefined && sortOrder !== undefined) ?
      { [mapUsersSortField[sortField]]: sortOrder === SortDirection.ASC ? "ASC" : "DESC" } : undefined,
  };
};
