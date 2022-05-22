import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import fs from "fs";
import { contentType } from "mime-types";
import { basename } from "path";
import { LINUX_PATH_REGEX } from "src/utils/validation";

const QuerystringSchema = Type.Object({
  path: Type.String({ description: "文件路径。根目录为用户的家目录", pattern: LINUX_PATH_REGEX }),
  download: Type.Optional(Type.Boolean({
    description: "文件应该被下载。如果为false，则设置Content-Disposition为inline，且body返回文件内容。否则为attachment; filename=\"\"",
  })),
});

const ResponsesSchema = Type.Object({
  // 200: 文件内容
  412: Type.Null({ description: "非文件" }),
  403: Type.Null({ description: "不允许访问此文件或者文件未找到" }),
});

export const getFileRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/file",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      const { path, download = true } = req.query;

      req.log.info("getFile %s as %s", path, req.user.identityId);

      // check access
      const { err } = await req.runWorkerAsCurrentUser("readable", path);
      if (err) {
        return rep.code(403).send(undefined);
      }

      const stat = await fs.promises.stat(path).catch(() => undefined);

      if (!stat) {
        return rep.code(403).send(undefined);
      }

      if (!stat.isFile()) {
        return await rep.code(412).send(undefined);
      }

      const filename = basename(path).replace("\"", "\\\"");


      if (download) {
        return rep
          .header("Content-Type", getContentType(filename, "application/octet-stream"))
          .header("Content-Disposition", `attachment; filename="${filename}"`)
          .sendFile(path, "/");
      } else {
        const stream = fs.createReadStream(path);
        return rep
          .header("Content-Type", getContentType(filename, "text/plain; charset=utf-8"))
          .header("Content-Disposition", `inline; filename="${filename}"`)
          .send(stream);
      }

    });
});

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
