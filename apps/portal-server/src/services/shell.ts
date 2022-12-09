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

import { createWriterExtensions } from "@ddadaal/tsgrpc-common";
import { plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { quote } from "shell-quote";
import { ShellServiceServer, ShellServiceService } from "src/generated/portal/shell";
import { clusterNotFound } from "src/utils/errors";
import { pipeline } from "src/utils/pipeline";
import { getClusterLoginNode, sshConnect } from "src/utils/ssh";

export const shellServiceServer = plugin((server) => {

  server.addService<ShellServiceServer>(ShellServiceService, {
    shell: async (call) => {

      const firstMessage = await call.readAsync();

      if (firstMessage?.message?.$case !== "connect") {
        throw <ServiceError> {
          code: status.INVALID_ARGUMENT,
          message: "The first message is not connect",
        };
      }

      const { message: { connect } } = firstMessage;

      const logger = call.logger.child({ shell: connect });

      logger.info("Received shell connection");

      const { cluster, userId, rows, cols, path } = connect;

      const loginNode = getClusterLoginNode(cluster);

      if (!loginNode) { throw clusterNotFound(cluster); }

      await sshConnect(loginNode, userId, logger, async (ssh) => {

        await ssh.withShell(async (channel) => {
          logger.info("Shell requested");

          const { writeAsync } = createWriterExtensions(channel);

          if (path) {
            logger.info("cd to path %s", path);
            await writeAsync(quote(["cd", path]) + "\n");
          }

          channel.on("exit", (...args: [code: string] | [code: null, signal: string]) => {
            logger.info("Shell exited with %o", ...args);

            const hasCode = args[0] !== null;

            call.write({ message: { $case: "exit", exit: {
              code: hasCode ? +args[0] : undefined,
              signal: hasCode ? undefined : args[1],
            } } });
          });

          // if either pipeline ends, ends the request
          await Promise.race([
            // shell -> client
            pipeline(
              channel,
              async function(chunk: Uint8Array) {
                return { message: { $case: "data" as const, data: { data: chunk } } };
              },
              call,
            ),

            // client -> shell
            pipeline(
              call.iter(),
              async function(req) {

                if (!req.message) {
                  throw <ServiceError> {
                    code: status.INVALID_ARGUMENT,
                    message: "Received a request without message",
                  };
                }

                if (req.message.$case === "resize") {
                  channel.setWindow(req.message.resize.rows + "", req.message.resize.cols + "", "", "");
                  return;
                }

                if (req.message.$case === "disconnect") {
                  logger.info("Disconnect received from client");
                  call.end();
                  return;
                }

                if (req.message.$case === "data") {
                  logger.info("Received data from client %s", req.message.data.data.toString());
                  return req.message.data.data;
                }

                throw <ServiceError> {
                  code: status.INVALID_ARGUMENT,
                  message: `Received unexpected message type ${req.message.$case}`,
                };
              },
              channel,
            ),
          ]).finally(() => { call.end(); channel.end(); });
        }, { cols, rows, term: "xterm-256color" });
      });


    },
  });

});
