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

import { join } from "path";
import { publicConfig } from "src/utils/config";

// 文件允许的最大导出行数
export const MAX_EXPORT_COUNT = 10000;

export const urlToExport = ({
  exportApi,
  columns,
  count,
  query,
}: {
    exportApi: string
    columns: string[],
    count: number,
    query: {[key: string]: string | number | boolean | string[] | undefined}
  },
) => {
  const exportQuery = `${exportApi}?${
    columns.map((column) => `columns=${column}`).join("&")
  }&${
    Object.keys(query)
      .filter((key) => query[key] !== undefined)
      .map((key) => {
        const value = query[key];
        if (Array.isArray(value) && (value as any[]).length === 0) {
          return `${key}=${encodeURIComponent("")}`;// 取消type必须存在后注释
        } else if (Array.isArray(value) && (value as string[]).length > 0) {
          return (query[key] as string[]).map((value) => `${key}=${encodeURIComponent(value)}`).join("&");
        } else {
          return `${key}=${encodeURIComponent(value as string | number | boolean)}`;
        }
      },
      ).join("&")
  }&count=${count}`;
  return join(publicConfig.BASE_PATH, `/api/file/${exportQuery}`);
};

