/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { SortOrder } from "@scow/protos/build/common/sort_order";
import { GetPaginatedChargeRecordsRequest_SortBy as ChargesSortBy } from "@scow/protos/build/server/charging";
import { GetJobsRequest_SortBy } from "@scow/protos/build/server/job";
import { GetAllUsersRequest_UsersSortField, SortDirection } from "@scow/protos/build/server/user";

import { DEFAULT_PAGE_SIZE, paginationProps } from "./orm";

// sort fields' text for mis pageComponent AllUsersTable
export const mapUsersSortField = {
  [GetAllUsersRequest_UsersSortField.USER_ID]: "userId",
  [GetAllUsersRequest_UsersSortField.NAME]: "name",
  [GetAllUsersRequest_UsersSortField.CREATE_TIME]: "createTime",
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

// 规范化GetJobsRequest_SortBy的名字
export const mapJobsSortField = {
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

// generate query options of all jobs
// with options: paginationProps, orderBy
export const generateGetJobsOptions = (
  page: number,
  pageSize?: number,
  sortBy?: GetJobsRequest_SortBy,
  sortOrder?: SortOrder,
) => {

  return {
    ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
    orderBy: (sortBy !== undefined && sortOrder !== undefined) ?
      { [mapJobsSortField[sortBy]]:
        sortOrder === SortOrder.ASCEND ? "ASC" : "DESC" } : undefined,
  };
};


// generate query options of all charges
// with options: paginationProps, orderBy
export const mapChargesSortField = {
  [ChargesSortBy.USER_ID]: "userId",
  [ChargesSortBy.TIME]: "time",
  [ChargesSortBy.TYPE]: "type",
  [ChargesSortBy.AMOUNT]: "amount",
};


export const generateChargersOptions = (
  page: number,
  pageSize?: number,
  sortBy?: ChargesSortBy,
  sortOrder?: SortOrder,
) => {
  return {
    ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
    orderBy: (sortBy !== undefined && sortOrder !== undefined) ?
      { [mapChargesSortField[sortBy]]:
        sortOrder === SortOrder.ASCEND ? "ASC" : "DESC" } : undefined,
  };
};
