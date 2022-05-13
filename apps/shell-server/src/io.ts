import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifyIO from "fastify-socket.io";
import * as pty from "node-pty";
import { UserInfo } from "src/auth";
import { clusters, config } from "src/config";
import { queryToIntOrDefault, queryToString } from "src/utils";

export const ioPlugin = fp(async (server) => {
  server.register(fastifyIO);
});

export function registerConnectionHandler(server: FastifyInstance) {
  server.io.on("connection", (socket) => {

    const { identityId } = socket.data as UserInfo;

    const logger = server.log.child({ ioUser: identityId });

    logger.info("Connection request received.");

    const cluster = queryToString(socket.handshake.query.cluster);

    if (!clusters[cluster]) {
      throw new Error(`Unknown cluster ${cluster}`);
    }

    const { cols, rows } = socket.handshake.query;

    const path = queryToString(socket.handshake.query.path);

    // create a pty and connect to ssh
    // if path is empty, it will be home page
    const host = `${identityId}@${clusters[cluster]}`;

    const args = [host, "-i", config.SSH_PRIVATE_KEY_PATH.replace("\"", "'")];
    if (path) {
      args.push("-t", "cd '" + path.replace(/\'/g, "'\\''") + "' ; exec ${SHELL} -l");
    }

    const ptyProcess = pty.spawn("ssh", args, {
      name: "xterm-color",
      cols: queryToIntOrDefault(cols, 80),
      rows: queryToIntOrDefault(rows, 30),
      cwd: process.env.HOME,
    });

    logger.info("SSH Process started");

    ptyProcess.onData(function(data) {
      socket.emit("data", data);
    });

    ptyProcess.onExit((e) => {
      logger.info("Process exited. %o", e);
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
}

