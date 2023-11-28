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

import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { entryTypeFromJSON, entryTypeToJSON, QuickEntry, UserServiceServer, UserServiceService }
  from "@scow/protos/build/portal/user";
import fs from "fs";
import path from "path";
import { getUserQuickEntryFileName } from "src/utils/user";

const quickEntryPath = "/etc/quickEntry";

export const userServiceServer = plugin((server) => {
  return server.addService<UserServiceServer>(UserServiceService, {
    getQuickEntry:async ({ request }) => {
      const { userId } = request;
      const filePath = path.join(quickEntryPath, getUserQuickEntryFileName(userId));

      // 读取 JSON 文件
      let jsonObject!: QuickEntry[];
      try {
        // 同步读取 JSON 文件
        const data = fs.readFileSync(filePath, "utf8");

        // 将 JSON 字符串解析为 JavaScript 对象
        jsonObject = JSON.parse(data);
      } catch (error) {
        // 如果文件不存在则返回空数组
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return [{ quickEntry:[]}];
        }

        // 其他错误则抛错
        throw <ServiceError> {
          code: status.UNAVAILABLE,
          message: `read file ${getUserQuickEntryFileName(userId)} failed`,
        };
      }

      return [{
        quickEntry:
        jsonObject.map((x) => ({ ...x, entryType:entryTypeFromJSON(x.entryType) })),
      }];
    },
    saveQuickEntry:async ({ request }) => {

      const { userId, quickEntry } = request;
      const jsonContent = JSON.stringify(quickEntry.map((x) => ({ ...x, entryType:entryTypeToJSON(x.entryType) })));
      const filePath = path.join(quickEntryPath, getUserQuickEntryFileName(userId));

      // 获取文件的目录路径
      const dirPath = path.dirname(filePath);

      // 检查目录是否存在，如果不存在则创建目录
      fs.mkdir(dirPath, { recursive: true }, (err) => {
        if (err) {
          throw <ServiceError> {
            code: status.UNAVAILABLE,
            message: `make dir ${dirPath} failed`,
          };
        } else {

          // 将内容写入文件
          fs.writeFile(filePath, jsonContent, (err) => {
            if (err) {
              throw <ServiceError> {
                code: status.UNAVAILABLE,
                message: `write file ${getUserQuickEntryFileName(userId)} failed`,
              };
            }
          });
        }
      });

      return [{}];
    },
  });
});
