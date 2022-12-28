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
import { queryToIntOrDefault, queryToString } from "@scow/lib-web/build/utils/querystring";
import { ShellResponse, ShellServiceClient } from "@scow/protos/build/portal/shell";
import { NextApiRequest } from "next";
import { join } from "path";
import { Server as ServerIO } from "socket.io";
import { checkCookie } from "src/auth/server";
import { AugmentedNextApiResponse } from "src/types/next";
import { getClient } from "src/utils/client";
import { runtimeConfig } from "src/utils/config";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: AugmentedNextApiResponse) => {

  if (!res.socket.server.io) {
    // @ts-ignore
    const io = new ServerIO(req.socket.server, {
      path: join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/shell/socketio"),
    });

    io.on("connection", async (socket) => {


      const user = await checkCookie(() => true, socket.request);

      if (typeof user === "number") {
        console.log("[io] token is not valid");
        socket.emit("data", "token is not valid");
        socket.disconnect();
        return;
      }


      const log = (message: string, ...optionalParams: any[]) => console.log(
        `[io] [${user.identityId}] ${message}`, optionalParams);

      log("Connection request received.");

      const cluster = queryToString(socket.handshake.query.cluster);

      if (!runtimeConfig.CLUSTERS_CONFIG[cluster]) {
        throw new Error(`Unknown cluster ${cluster}`);
      }

      const path = queryToString(socket.handshake.query.path);

      const { cols, rows } = socket.handshake.query;

      const client = getClient(ShellServiceClient);

      const stream = asyncDuplexStreamCall(client, "shell");

      await stream.writeAsync({ message: { $case: "connect", connect: {
        cluster, userId: user.identityId,
        cols: queryToIntOrDefault(cols, 80),
        rows: queryToIntOrDefault(rows, 30),
        path,
      } } });

      log("Connected to shell");

      stream.on("data", (chunk: ShellResponse) => {
        switch (chunk.message?.$case) {
        case "data":
          socket.emit("data", chunk.message.data.data);
          break;
        case "exit":
          socket.emit("exit", { exitCode: chunk.message.exit.code, signal: chunk.message.exit.signal });
          break;
        }
      });

      socket.on("resize", (data: { cols: number, rows: number }) => {
        stream.write({ message: { $case: "resize", resize: { cols: data.cols, rows: data.rows } } });
      });

      socket.on("data", ([data]: [string]) => {

        log("--------------------------------Receive terminal data: ", data);


        stream.write({ message:  { $case :"data", data: { data: Buffer.from(data) } } });
      });

      socket.on("disconnect", () => {
        stream.write({ message: { $case: "disconnect", disconnect: {} } });
        stream.end();
      });

    });

    res.socket.server.io = io;
  }
  res.end();
};
