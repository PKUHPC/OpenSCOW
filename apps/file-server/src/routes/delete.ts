import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { LINUX_PATH_REGEX } from "src/utils/validation";

const QuerystringSchema = Type.Object({
  path: Type.String({ description: "要删除的文件或者目录的路径", pattern: LINUX_PATH_REGEX }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "操作成功" }),
  403: Type.Null({ description: "文件不存在或者权限不允许" }),
});

export const deleteRoute = fp(async (f) => {
  f.delete<{
    Querystring: Static<typeof QuerystringSchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/item",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      const { path } = req.query;

      req.log.info("remove %s as %s", path, req.user.identityId);

      const { err } = await req.runWorkerAsCurrentUser("delete", path);

      if (!err) {
        return rep.code(204).send(undefined);
      } else {
        return rep.code(403).send(undefined);
      }

    });
});
