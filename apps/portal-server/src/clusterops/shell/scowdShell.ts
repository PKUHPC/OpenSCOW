import { ScowdClient } from "@scow/lib-scowd/build/client";
import { ShellOps } from "src/clusterops/api/shell";
import { mapTRPCExceptionToGRPC } from "src/utils/scowd";

export const scowdShellServices = (client: ScowdClient): ShellOps => ({
  shell: async (request, logger) => {

    const { call, cluster, loginNode, userId, rows, cols } = request;

    try {
      const scowdStream = client.shell.shell((async function* () {
        yield { message: { case: "connect", value: { cluster, loginNode, userId, rows, cols } } };

        for await (const data of call.iter()) {

          if (data.message?.$case === "resize") {
            // 640 and 480 are default values
            yield { message: { case: "resize", value: data.message.resize } };
          }

          if (data.message?.$case === "disconnect") {
            logger.info("Disconnect received from client");
            yield { message: { case: "disconnect", value: data.message.disconnect } };
            call.end();
            return;
          }

          if (data.message?.$case === "data") {
            logger.info("Received data from client %s", data.message.data.data.toString());
            yield { message: { case: "data", value: { data: data.message.data.data as Uint8Array<ArrayBuffer> } } };
          }
        }
      })());

      for await (const data of scowdStream) {
        if (!data?.message.case || data?.message.case === "exit") { break; }

        call.write({ message: { $case: data.message.case, data: data.message.value } });
      }

    } catch (err) {
      throw mapTRPCExceptionToGRPC(err);
    } finally {
      call.end();
    }

    return {};
  },
});
