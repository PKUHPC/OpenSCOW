import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";

const QuerystringSchema = Type.Object({
  identityId: Type.String(),
});

const ResponsesSchema = Type.Object({
  200: Type.Object({ user: Type.Object({ identityId: Type.String() }) }),
  404: Type.Object({ code: Type.Literal("USER_NOT_FOUND") }),
  501: Type.Null({ description: "此功能在当前服务器配置下不可用" }),
});

/**
 * 查询用户信息
 */
export const getUserRoute = fp(async (f) => {
  f.get<{
    Querystring: Static<typeof QuerystringSchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/user",
    {
      schema: {
        querystring: QuerystringSchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {
      if (!f.auth.createUser) {
        return await rep.code(501).send(null);
      }

      const { identityId } = req.query;

      const result = await f.auth.createUser.getUser(identityId, req);

      if (result) {
        return rep.code(200).send({ user: { identityId: result.identityId } });
      } else {
        return rep.code(404).send({ code: "USER_NOT_FOUND" });
      }


    },
  );
});
