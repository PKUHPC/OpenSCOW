import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { LINUX_PATH_REGEX } from "src/utils/validation";

const BodySchema = Type.Object({
  from: Type.String({ description: "文件路径", pattern: LINUX_PATH_REGEX }),
  to: Type.String({ description: "新路径", pattern: LINUX_PATH_REGEX }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "操作成功" }),
  403: Type.Null({ description: "文件不存在或者权限不允许" }),
});

export const mvRoute = fp(async (f) => {
  f.patch<{
    Body: Static<typeof BodySchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/item",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      const { from, to } = req.body;

      req.log.info("rename %s to %s as %s", from, to, req.user.identityId);

      const { err } = await req.runWorkerAsCurrentUser("move", from, to);

      if (!err) {
        return rep.code(204).send(undefined);
      } else {
        return rep.code(403).send(undefined);
      }
    });
});
