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

import { GetJobsRequest_SortBy, GetJobsRequest_SortOrder } from "@scow/protos/build/server/job";
import { GetAllUsersRequest_UsersSortField, SortDirection } from "@scow/protos/build/server/user";

import { DEFAULT_PAGE_SIZE, paginationProps } from "./orm";

// sort fields' text for mis pageComponent AllUsersTable
export const mapUsersSortField = {
  [GetJobsRequest_SortBy.ACCOUNT]: "account",
  [GetJobsRequest_SortBy.CLUSTER]: "cluster",
  [GetJobsRequest_SortBy.ID_JOB]: "idJob",
  [GetJobsRequest_SortBy.JOB_NAME]: "jobName",
  [GetJobsRequest_SortBy.PARTITION]: "partition",
  [GetJobsRequest_SortBy.PRICE]: "price",
  [GetJobsRequest_SortBy.QOS]: "qos",
  [GetJobsRequest_SortBy.TIME_END]: "timeEnd",
  [GetJobsRequest_SortBy.TIME_SUBMIT]: "timeSubmit",
  [GetJobsRequest_SortBy.USER]: "user",
};


// generate query options of all users
// with options: paginationProps, orderBy
export const generateAllUsersQueryOptions = (
  page: number,
  pageSize?: number,
  sortField?: GetAllUsersRequest_UsersSortField,
  sortOrder?: SortDirection) => {
  return {
    ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
    orderBy: (sortField !== undefined && sortOrder !== undefined) ?
      { [mapUsersSortField[sortField]]: sortOrder === SortDirection.ASC ? "ASC" : "DESC" } : undefined,
  };
};

export const generateGetJobsOptions = (
  page: number,
  pageSize?: number,
  sortBy?: GetJobsRequest_SortBy,
  sortOrder?: GetJobsRequest_SortOrder,
) => {

  return {
    ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
    orderBy: (sortBy !== undefined && sortOrder !== undefined) ?
      { [mapUsersSortField[sortBy]]:
        sortOrder === GetJobsRequest_SortOrder.ASCEND ? "ASC" : "DESC" } : undefined,
  };
};
