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

import { stringify } from "csv-stringify";
import { Transform } from "stream";

/**
 *
 * @param headerColumns csv文件的表头
 * @param columns 需要导出的列
 * @returns
 */
export const getCsvStringify = (headerColumns: {[key in string]: string}, columns: string[]) => {

  if (columns.length) {
    Object.keys(headerColumns).forEach((key) => {
      if (!columns.includes(key) && key !== "id") {
        delete headerColumns[key];
      }
    });
  }
  const transformOptions = {
    header: true,
    columns: headerColumns,
  };

  const csvStringify = stringify(transformOptions);

  return csvStringify;
};


/**
 *
 * @param formatFn 格式化grpc返回的数据成页面展示的数据格式
 * @returns 返回一个Transform对象
 */
export const getCsvObjTransform = (formatFn: (obj: any) => any) => {
  return new Transform({
    objectMode: true,
    transform(x, encoding, callback) {
      try {
        const obj = formatFn(JSON.parse(x.chunk.toString(encoding)));
        callback(null, obj);
      } catch (error) {
        callback(error);
      }
    },
  });
};
