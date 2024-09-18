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

import { PaginationConfig } from "antd/es/pagination/Pagination";
import { useState } from "react";

export const usePagination = () => {
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });

  const onChange = (page: number, pageSize: number) => setPagination({
    page, pageSize,
  });

  return {
    pagination,
    onChange,
    getPaginationOptions: (total?: number) => ({
      total,
      pageSize: pagination.pageSize,
      onChange,
      current: pagination.page,
    }) satisfies PaginationConfig,
  } as const;

};
