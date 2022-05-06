import multipartPlugin, { Multipart } from "@fastify/multipart";
import fp from "fastify-plugin";
import fs from "fs";
import { pipeline } from "stream";
import util from "util";

import { ErrorPluginName } from "./error";

const pump = util.promisify(pipeline);

export const uploadPlugin = fp(async (fastify) => {
  await fastify.register(multipartPlugin, {});

  fastify.registerErrorHandler(
    fastify.multipartErrors.RequestFileTooLargeError as any,
    (_e, rep) => {
      rep.code(413).send({ reason: "FileTooLarge" });
    });
}, {
  dependencies: [ErrorPluginName],
});

export async function saveFile(data: Multipart, path: string) {
  return await pump(data.file, fs.createWriteStream(path));
}
