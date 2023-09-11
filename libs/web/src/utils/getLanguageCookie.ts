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

import { IncomingMessage } from "http";
import { parseCookies } from "nookies";

export function getLanguageCookie(req: IncomingMessage | undefined): string {
  const cookies = parseCookies({ req });

  if (cookies && cookies.language) {
    return cookies.language;
  } else {
    // 如果 Cookie 不合法或不存在，尝试从请求头中获取语言偏好
    const acceptLanguageHeader = req?.headers["accept-language"];
    if (acceptLanguageHeader) {
      // 解析请求头中的语言偏好，提取第一个语言选项
      const preferredLanguages = acceptLanguageHeader.split(",");
      if (preferredLanguages.length > 0) {
        // 判断第一个语言是什么
        switch (preferredLanguages[0].trim()) {
        case "zh-CN":
        case "zh":
          return "zh_cn";
        case "en-US":
        case "en":
          return "en";
        // 当不是中文也不是英文，返回英文
        default:
          return "en";
        }
      }
    }
  }

  return "zh_cn";
}
