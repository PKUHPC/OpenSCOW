import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { LINUX_PATH_REGEX } from "src/utils/validation";
import { ALREADY_EXISTS } from "src/worker";

const BodySchema = Type.Object({
  path: Type.String({ description: "要创建的目录的路径", pattern: LINUX_PATH_REGEX }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "操作成功" }),
  403: Type.Null({ description: "权限不允许" }),
  409: Type.Null({ description: "文件已经存在" }),
});

export const mkdirRoute = fp(async (f) => {
  f.post<{
    Body: Static<typeof BodySchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/dir",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      const { path } = req.body;

      req.log.info("mkdir %s as %s", path, req.user.identityId);

      const { err } = await req.runWorkerAsCurrentUser("mkdir", path);

      if (!err) {
        return rep.code(204).send(undefined);
      } else {
        if (err.code === ALREADY_EXISTS) {
          return rep.code(409).send(undefined);
        }
        return rep.code(403).send(undefined);
      }

    });
});
