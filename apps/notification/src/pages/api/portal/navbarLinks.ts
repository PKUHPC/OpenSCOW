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

import { NextApiRequest, NextApiResponse } from "next";
import path from "path";
import { hasUnreadMessage } from "src/utils/message/has-unread-message";
import { BASE_PATH } from "src/utils/processEnv";

import { applyMiddleware } from "../middleware/cors";

async function handler(req: NextApiRequest, res: NextApiResponse) {

  const searchParams = req.query;
  const scowLangId = searchParams.scowLangId;

  const isChinese = scowLangId === "zh_cn";

  if (req.method === "POST") {

    const cookie = req.headers.cookie;
    // 将 cookie 字符串解析为对象
    const cookies = cookie?.split(";").reduce<Record<string, string>>((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      if (key && value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // 获取名为 'SCOW_USER' 的 cookie
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const scowUserCookie = cookies?.["SCOW_USER"];

    const svgFilePath = (cookie && scowUserCookie && await hasUnreadMessage(scowUserCookie))
      ? path.join(BASE_PATH, "icons", "dot-ding.svg")
      : path.join(BASE_PATH, "icons", "ding.svg");

    const navbarLinks = [
      {
        path: "/notification",
        text: isChinese ? "消息系统" : "Messaging System",
        icon: { src: svgFilePath },
      },
    ];

    res.status(200).json({ navbarLinks });
  } else {
    res.status(405).json({ message: "Method Not Allowed" });
  }
}

export default applyMiddleware(handler);

