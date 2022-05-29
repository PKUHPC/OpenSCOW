import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";

const ResponsesSchema = Type.Object({
  200: Type.Object({
    path: Type.String(),
  }, { description: "操作成功" }),
});

export const getHomeDirRoute = fp(async (f) => {
  f.get<{
    Querystring: {},
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/home",
    {
      schema: {
        response: ResponsesSchema.properties,
      },
    },
    async (req) => {
      return { path: req.user.getHomeDir() };
    });
});
