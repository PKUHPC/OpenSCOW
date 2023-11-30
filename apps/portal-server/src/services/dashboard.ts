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
import { DashboardServiceServer, DashboardServiceService, Entry }
  from "@scow/protos/build/portal/dashboard";
import { promises as fsPromises } from "fs";
import path from "path";
import { getUserQuickEntryFileName } from "src/utils/dashboard";

const quickEntryPath = "/var/lib/scow/quickEntries";

export const dashboardServiceServer = plugin((server) => {
  return server.addService<DashboardServiceServer>(DashboardServiceService, {
    getQuickEntries:async ({ request }) => {
      const { userId } = request;
      const filePath = path.join(quickEntryPath, userId, getUserQuickEntryFileName(userId));

      // 读取 JSON 文件
      let jsonObject!: Entry[];
      try {
        // 同步读取 JSON 文件
        const data = await fsPromises.readFile(filePath, "utf8");

        // 将 JSON 字符串解析为 JavaScript 对象
        jsonObject = JSON.parse(data);
      } catch (error) {
        // 如果文件不存在则返回空数组
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return [{ quickEntries:[]}];
        }

        // 其他错误则抛错
        throw <ServiceError> {
          code: status.UNAVAILABLE,
          message: `read file ${getUserQuickEntryFileName(userId)} failed`,
        };
      }

      return [{
        quickEntries:jsonObject,
      }];
    },
    saveQuickEntries:async ({ request }) => {

      const { userId, quickEntries } = request;
      const jsonContent = JSON.stringify(quickEntries);
      const filePath = path.join(quickEntryPath, userId, getUserQuickEntryFileName(userId));

      // 获取文件的目录路径
      const dirPath = path.dirname(filePath);

      try {
        // 检查目录是否存在，如果不存在则创建目录
        await fsPromises.mkdir(dirPath, { recursive: true });

        // 将内容写入文件
        await fsPromises.writeFile(filePath, jsonContent);

        return [{}];
      } catch (err) {

        const errorMessage = err instanceof Error && "message" in err
          ? `Error saving quick entry for user ${userId}: ${err.message}`
          : "";

        throw <ServiceError> {
          code: status.UNAVAILABLE,
          message: errorMessage || `An error occurred while saving quick entry for user ${userId}`,
        };
      }
    },
  });
});
