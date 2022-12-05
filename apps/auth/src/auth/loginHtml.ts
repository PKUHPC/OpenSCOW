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

import { FastifyReply, FastifyRequest } from "fastify";
import { join } from "path";
import { AUTH_EXTERNAL_URL, config, FAVICON_URL } from "src/config/env";
import { uiConfig } from "src/config/ui";

function parseHostname(req: FastifyRequest): string | undefined {

  if (!req.headers.referer) {
    return undefined;
  }

  try {
    const url = new URL(req.headers.referer);
    return url.hostname;
  } catch {
    return undefined;
  }
}


export async function serveLoginHtml(err: boolean, callbackUrl: string, req: FastifyRequest, rep: FastifyReply) {

  const hostname = parseHostname(req);

  const html = `
  <!DOCTYPE html>
<html>

<head>
    <title>登录</title>
    <link href="${join(config.BASE_PATH, AUTH_EXTERNAL_URL, "/public/assets/tailwind.min.css")}" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="${FAVICON_URL}"></link>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        .bg-pku-red {
            background-color: #94070A;
        }
    </style>
</head>

<body class="bg-gray-300" style="font-family:Roboto">
    <div class="w-full h-screen flex items-center justify-center">
        <form class="w-full md:w-1/3 bg-white rounded-lg py-4" method="post" action="">
            <h2 class="text-3xl text-center text-gray-700 mb-4">登录</h2>
            <div class="px-12">
                <div class="w-full mb-4">
                    <div class="flex items-center">
                        <input type='text' name="username" placeholder="用户名"
                            class="-mx-6 px-8  w-full border rounded px-3 py-2 text-gray-700 focus:outline-none" />
                    </div>
                </div>
                <div class="w-full mb-4">
                    <div class="flex items-center">
                        <input name="password" placeholder="密码" type="password"
                            class="-mx-6 px-8 w-full border rounded px-3 py-2 text-gray-700 focus:outline-none" />
                    </div>
                </div>
                <input type="hidden" name="callbackUrl" value="${callbackUrl}" />
                ${err ? `
                <p class="my-4 text-center text-red-600">用户名/密码无效，请检查。</p>
                ` : ""}
                <button type="submit" class="w-full py-2 rounded-full bg-pku-red text-gray-100 focus:outline-none">
                    登录
                </button>
        </form>
      </div>
    <p class="absolute bottom-0 w-full text-center my-4 text-gray-500 text-sm">
      ${(hostname && uiConfig?.footer?.hostnameTextMap?.[hostname]) ?? uiConfig?.footer?.defaultText ?? ""}
    </p>
</body>

</html>
`;
  rep.status(err ? 403 : 200).type("text/html;charset=UTF-8").send(html);
}
