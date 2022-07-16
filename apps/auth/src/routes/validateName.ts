import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";

const QuerystringSchema = Type.Object({
  identityId: Type.String(),
  name: Type.String(),
});

const ResponsesSchema = Type.Object({
  200: Type.Object({
    result: Type.Boolean({ description: "验证结果，ID和名字是否匹配" }),
  }),
  404: Type.Null({ description: "用户ID不存在" }),
  501: Type.Null({ description: "此功能在当前服务器配置下不可用" }),
});

/**
 * 验证一个ID和名字是否匹配。
 */
export const validateNameRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/validateName",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      if (!f.auth.validateName) {
        return await rep.code(501).send(null);
      }

      const { identityId, name } = req.query;

      const result = await f.auth.validateName(identityId, name, req);

      if (result === "Match") {
        return { result: true };
      } else if (result === "NotMatch") {
        return { result: false };
      } else if (result === "NotFound") {
        await rep.status(404).send(null);
        return;
      }

      throw new Error(`Unknown validateName result ${result}`);
    },
  );
});
