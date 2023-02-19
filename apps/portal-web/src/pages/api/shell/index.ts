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

import { asyncDuplexStreamCall } from "@ddadaal/tsgrpc-client";
import { queryToIntOrDefault } from "@scow/lib-web/build/utils/querystring";
import { ShellResponse, ShellServiceClient } from "@scow/protos/build/portal/shell";
import { normalizePathnameWithQuery } from "@scow/utils";
import { NextApiRequest } from "next";
import { join } from "path";
import { checkCookie } from "src/auth/server";
import { AugmentedNextApiResponse } from "src/types/next";
import { getClient } from "src/utils/client";
import { publicConfig, runtimeConfig } from "src/utils/config";
import { parse } from "url";
import { WebSocketServer } from "ws";

export type ShellQuery = {
  cluster: string;
  path?: string;

  cols?: string;
  rows?: string;
}

export type ShellInputData =
  | { $case: "resize", resize: { cols: number; rows: number } }
  | { $case: "data", data: { data: string }}
  | { $case: "disconnect" }
;
export type ShellOutputData =
  | { $case: "data", data: { data: string } }
  | { $case: "exit", exit: { code?: number; signal?: string }}
;
export const config = {
  api: {
    bodyParser: false,
  },
};

const wss = new WebSocketServer({ noServer: true });

wss.on("connection", async (ws, req) => {
  const user = await checkCookie(() => true, req);

  if (typeof user === "number") {
    console.log("[shell] token is not valid");
    ws.close(0, "token is not valid");
    return;
  }

  const log = (message: string, ...optionalParams: any[]) => console.log(
    `[io] [${user.identityId}] ${message}`, optionalParams);

  log("Connection request received.");

  const query = new URLSearchParams(parse(req.url!).query!);

  const cluster = query.get("cluster");

  if (!cluster || !runtimeConfig.CLUSTERS_CONFIG[cluster]) {
    throw new Error(`Unknown cluster ${cluster}`);
  }

  const path = query.get("path") ?? undefined;
  const cols = query.get("cols");
  const rows = query.get("rows");

  const client = getClient(ShellServiceClient);

  const stream = asyncDuplexStreamCall(client, "shell");

  await stream.writeAsync({ message: { $case: "connect", connect: {
    cluster, userId: user.identityId,
    cols: queryToIntOrDefault(cols, 80),
    rows: queryToIntOrDefault(rows, 30),
    path,
  } } });

  log("Connected to shell");

  const send = (data: ShellOutputData) => {
    ws.send(JSON.stringify(data));
  };

  stream.on("error", (err) => {
    log("Error occurred from server. Disconnect.", err);
    send({ $case: "exit", exit: { code: 1 } });
  });


  stream.on("data", (chunk: ShellResponse) => {
    switch (chunk.message?.$case) {
    case "data":
      send({ $case: "data", data: { data: chunk.message.data.data.toString() } });
      break;
    case "exit":
      send({ $case: "exit", exit: { code: chunk.message.exit.code, signal: chunk.message.exit.signal } });
      break;
    }
  });

  ws.on("error", (err) => {
    log("Error occurred from client. Disconnect.", err);
    stream.write({ message: { $case: "disconnect", disconnect: {} } });
    stream.end();
  });

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString()) as ShellInputData;

    switch (message.$case) {
    case "data":
      stream.write({ message:  { $case :"data", data: { data: Buffer.from(message.data.data) } } });
      break;
    case "resize":
      stream.write({ message: { $case: "resize", resize: { cols: message.resize.cols, rows: message.resize.rows } } });
      break;
    case "disconnect":
      stream.write({ message: { $case: "disconnect", disconnect: {} } });
      stream.end();
      break;
    }

  });

});

export const setupShellServer = (res: AugmentedNextApiResponse) => {
  res.socket.server.on("upgrade", (request, socket, head) => {
    const url = normalizePathnameWithQuery(request.url!);
    if (!url.startsWith(join(publicConfig.BASE_PATH, "/api/shell"))) {
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });

  });
};

export default async (req: NextApiRequest, res: AugmentedNextApiResponse) => {
  res.end();
};
