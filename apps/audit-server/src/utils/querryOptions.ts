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

import {
  GetOperationLogsRequest_SortBy,
} from "@scow/protos/build/audit/operation_log";
import { SortOrder } from "@scow/protos/build/common/sort_order";

import { DEFAULT_PAGE_SIZE, paginationProps } from "./orm";
// generate query options of all charges
// with options: paginationProps, orderBy
export const mapOperationSortField = {
  [GetOperationLogsRequest_SortBy.ID]: "id",
  [GetOperationLogsRequest_SortBy.OPERATION_RESULT]: "operationResult",
  [GetOperationLogsRequest_SortBy.OPERATION_TIME]: "operationTime",
  [GetOperationLogsRequest_SortBy.OPERATOR_IP]: "operatorIp",
  [GetOperationLogsRequest_SortBy.OPERATOR_USER_ID]:"operatorUserId",
  [GetOperationLogsRequest_SortBy.UNKNOWN]:"undefined",
};

export const generateOperationOptions = (
  page: number,
  pageSize?: number,
  sortBy?: GetOperationLogsRequest_SortBy,
  sortOrder?: SortOrder,
) => {
  return {
    ...paginationProps(page, pageSize || DEFAULT_PAGE_SIZE),
    orderBy: (sortBy !== undefined && sortOrder !== undefined) ?
      { [mapOperationSortField[sortBy]]:
        sortOrder === SortOrder.ASCEND ? "ASC" : "DESC" } : undefined,
  };
};
