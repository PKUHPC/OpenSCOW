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

import { contentType } from "mime-types";
import { NextRequest, NextResponse } from "next/server.js";
import { basename } from "path";
import { getUserInfo } from "src/server/auth/server.js";
import stream from "stream";
import { z } from "zod";

// if the contentType is one of these, they can be previewed
// return as text/plain
const textFiles = ["application/x-sh"];

function getContentType(filename: string, defaultValue: string) {
  const type = contentType(basename(filename));

  if (!type) {
    return defaultValue;
  }

  if (textFiles.some((x) => type.startsWith(x))) {
    return "text/plain; charset=utf-8";
  }

  return type;
}

const queryZod = z.object({

  clusterId: z.string(),
  path: z.string(),
  /**
     * 文件应该被下载
     * 如果为false，则设置Content-Disposition为inline，且body返回文件内容。
     * 否则为attachment; filename=\"\"",
     */
  download: z.enum(["true", "false"]).default("true"),
});

export type DownloadQuery = z.infer<typeof queryZod>;

export async function GET(request: NextRequest) {

  const user = await getUserInfo(request);

  if (!user) {
    return NextResponse.json({ code: "UNAUTHENTICATED" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const { download, path, clusterId } = queryZod.parse(Object.fromEntries(searchParams));

  const filename = basename(path).replace("\"", "\\\"");
  const dispositionParm = "filename* = UTF-8''" + encodeURIComponent(filename);


  try {

    // const reply = await asyncUnaryCall(client, "getFileMetadata", {
    //   clusterId, path, resourceId,
    // }, { metadata: setTokenMetadata(user.token), options: undefined });

    // const stream = asyncReplyStreamCall(client, "download", {
    //   clusterId, path, resourceId,
    // }, { metadata: setTokenMetadata(user.token), options: undefined });

    // return new NextResponse(new ReadableStream({
    //   async pull(controller) {
    //     for await (const chunk of stream.iter()) {
    //       controller.enqueue(new Uint8Array(chunk.chunk));
    //     }
    //     controller.close();
    //   },
    // }), {
    //   status: 200,
    //   headers: download === "true" ? {
    //     "Content-Type": getContentType(filename, "application/octet-stream"),
    //     "Content-Disposition": `attachment; ${dispositionParm}`,
    //     "Content-Length": String(reply.size),
    //   } : {
    //     "Content-Type": getContentType(filename, "text/plain; charset=utf-8"),
    //     "Content-Disposition": `inline; ${dispositionParm}`,
    //     "Content-Length": String(reply.size),
    //   },
    // });
  } catch (e: any) {

  }

}
