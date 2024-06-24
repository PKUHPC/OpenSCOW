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
import iconv from "iconv-lite";
import { Encoding } from "src/models/exportFile";
import { getContentType } from "src/utils/server";
import { Transform } from "stream";

/**
 *
 * @param headerColumns csv文件的表头
 * @param columns 需要导出的列
 * @returns
 */
export const getCsvStringify = (headerColumns: { [key in string]: string }, columns: string[]) => {

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

type exportKey = "users" | "accounts" | "payRecords" | "chargeRecords" | "operationLogs";;

/**
 *
 * @param formatFn 格式化grpc返回的数据成页面展示的数据格式
 * @returns 返回一个Transform对象
 */
export const getCsvObjTransform = (key: exportKey, formatFn: (obj: any) => any) => {
  return new Transform({
    objectMode: true,
    transform(chunk, _, callback) {
      try {
        chunk[key].forEach((obj: any) => {
          const formattedData = formatFn(obj);
          this.push(formattedData);
        });
        callback();
      } catch (error) {
        callback(error);
      }
    },
  });
};

// 创建编码转换流到管道
export const createEncodingTransform = (encoding: Encoding) => {
  console.log("encoding.toLowerCase()", encoding);

  return new Transform({
    transform(chunk, _, callback) {
      let encodedBuffer;
      if (encoding.toLowerCase() === "gb18030") {
        encodedBuffer = iconv.encode(chunk.toString(), "gb18030");
      } else if (encoding.toLowerCase() === "utf-8") {
        encodedBuffer = chunk.toString("utf-8");
      } else {
        encodedBuffer = chunk; // 默认情况下，不改变编码
      }
      callback(null, encodedBuffer);
    },
  });
};

// 获取带charset的Content-Type
export const getContentTypeWithCharset = (filename: string, encoding: Encoding) => {
  // 获取 MIME 类型
  const contentType = getContentType(filename, "application/octet-stream");
  // 添加 charset 信息
  let contentTypeWithCharset;
  if (contentType.includes("charset=")) {
    contentTypeWithCharset = contentType.replace(/charset=[^;]+/, `charset=${encoding}`);
  } else {
    contentTypeWithCharset = `${contentType}; charset=${encoding}`;
  }
  return contentTypeWithCharset;
};
