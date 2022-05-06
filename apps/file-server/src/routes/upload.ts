import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { saveFile } from "src/plugins/upload";
import { LINUX_PATH_REGEX } from "src/utils/validation";

const QuerystringSchema = Type.Object({
  path: Type.String({ description: "文件所在目录路径", pattern: LINUX_PATH_REGEX }),
});

const ResponsesSchema = Type.Object({
  201: Type.Null({ description: "上传成功" }),
  403: Type.Null({ description: "权限不允许" }),
});

export const uploadRoute = fp(async (f) => {
  f.post<{
    Querystring: Static<typeof QuerystringSchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/upload",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { path } = req.query;

      req.log.info("uploading to %s as %s", path, req.user.identityId);

      // create the file as the user
      const { err } = await req.runWorkerAsCurrentUser("createFile", path);
      req.log.info("%s created as %s", path, req.user.identityId);

      if (err) {
        return rep.code(403).send(undefined);
      }

      const data = await req.file({});

      // pump the content into the file
      await saveFile(data, path);
      req.log.info("content has been written into %s", path);

      return rep.code(201).send(undefined);
    });
});
