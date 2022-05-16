import { NextApiRequest } from "next";
import * as pty from "node-pty";
import { join } from "path";
import { Server as ServerIO } from "socket.io";
import { validateToken } from "src/auth/token";
import { NextApiResponseServerIO } from "src/types/socket";
import { runtimeConfig } from "src/utils/config";
import { queryToIntOrDefault, queryToString } from "src/utils/querystring";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {

  if (!res.socket.server.io) {
    // @ts-ignore
    const io = new ServerIO(req.socket.server, {
      path: join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/shell/socketio"),
    });

    io.on("connection", async (socket) => {

      const token = socket.handshake.auth.token;

      const user = token ? await validateToken(token) : undefined;

      if (!user) {
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

      // create a pty and connect to ssh
      // if path is empty, it will be home page
      const host = `${user.identityId}@${runtimeConfig.CLUSTERS_CONFIG[cluster].loginNodes[0]}`;

      const args = [host, "-i", runtimeConfig.SSH_PRIVATE_KEY_PATH.replace("\"", "'")];
      if (path) {
        args.push("-t", "cd '" + path.replace(/\'/g, "'\\''") + "' ; exec ${SHELL} -l");
      }

      const { cols, rows } = socket.handshake.query;

      const ptyProcess = pty.spawn("ssh", args, {
        name: "xterm-color",
        cols: queryToIntOrDefault(cols, 80),
        rows: queryToIntOrDefault(rows, 30),
        cwd: process.env.HOME,
      });

      log("SSH Process started");

      ptyProcess.onData(function(data) {
        socket.emit("data", data);
      });

      ptyProcess.onExit((e) => {
        log("Process exited. ", e);
        socket.emit("exit", e);
      });

      socket.on("resize", (data: { cols: number, rows: number }) => {
        ptyProcess.resize(data.cols, data.rows);
      });

      socket.on("data", (data) => {
        ptyProcess.write(data);
      });

      socket.on("disconnect", () => {
        ptyProcess.kill("SIGKILL");
      });

    });

    res.socket.server.io = io;
  }
  res.end();
};
