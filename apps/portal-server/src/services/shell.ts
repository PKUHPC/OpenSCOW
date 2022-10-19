import { plugin } from "@ddadaal/tsgrpc-server";
import { augmentedWriter } from "@ddadaal/tsgrpc-server/lib/utils";
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

          const { writeAsync } = augmentedWriter(channel);

          if (path) {
            logger.info("cd to path %s", path);
            await writeAsync(quote(["cd", path]) + "\n");
          }

          const abortController = new AbortController();

          channel.on("exit", (...args: [code: string] | [code: null, signal: string]) => {
            logger.info("Shell exited with %o", ...args);
            abortController.abort();
            call.write({ message: { $case: "exit", exit: {
              code: args[0] ? +args[0] : undefined,
              signal: args[0] ? undefined : args[1],
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
                  abortController.abort();
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
              { signal: abortController.signal },
            ),
          ]).finally(() => { call.end(); channel.end(); });
        }, { cols, rows });
      });


    },
  });

});
