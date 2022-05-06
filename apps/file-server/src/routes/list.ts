import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { LINUX_PATH_REGEX } from "src/utils/validation";
import { NOT_DIRECTORY } from "src/worker";

const QuerystringSchema = Type.Object({
  path: Type.String({ description: "目录路径。根目录为用户的家目录", pattern: LINUX_PATH_REGEX }),
});

const FileInfo = Type.Union([
  Type.Object({
    name: Type.String({ description: "文件名" }),
    type: Type.Enum({ ERROR: "error" } as const),
  }, { description: "stat失败的文件" }),
  Type.Object({
    name: Type.String({ description: "文件名" }),
    type: Type.Enum({ FILE: "file", DIR: "dir" } as const),
    size: Type.Integer({ description: "文件大小：字节" }),
    mtime: Type.String({ description: "mtime" }),
    mode: Type.Integer({ description: "mode" }),
  }),
]);

const ResponsesSchema = Type.Object({
  200: Type.Object({
    items: Type.Array(FileInfo, { description: "目录下的文件" }),
  }, { description: "目录下的文件列表" }),
  412: Type.Null({ description: "非目录" }),
  403: Type.Null({ description: "不允许访问此目录。可能因为目录未找到，或者权限不足" }),
});

export type FileInfo = Static<typeof FileInfo>;

export type Responses = Static<typeof ResponsesSchema>;

export const listRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>,
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/dir",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      const { path: fullPath } = req.query;

      req.log.info("list %s as %s", fullPath, req.user.identityId);

      // check access
      const { err, stdout } = await req.runWorkerAsCurrentUser("ls", fullPath);

      if (err) {
        if (err.code === NOT_DIRECTORY) {
          return rep.code(412).send(undefined);
        }
        return rep.code(403).send(undefined);
      }

      const items = JSON.parse(stdout) as FileInfo[];

      return { items };

    });
});
