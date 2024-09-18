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

export const DEFAULT_PAGE_SIZE = 50;

export const paginationProps = (page?: number, pageSize: number = DEFAULT_PAGE_SIZE) => ({
  offset: ((page ?? 1) - 1) * pageSize,
  limit: pageSize,
});

export const DATETIME_TYPE = "DATETIME(6)";

export const CURRENT_TIMESTAMP = "CURRENT_TIMESTAMP(6)";
