import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";

const QuerystringSchema = Type.Object({
  identityId: Type.String(),
});

const ResponsesSchema = Type.Object({
  200: Type.Object({ user: Type.Object({ identityId: Type.String() }) }),
  404: Type.Object({ code: Type.Literal("USER_NOT_FOUND") }),
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

      const { identityId } = req.query;

      const result = await f.auth.getUser(identityId, req);

      if (result) {
        return rep.code(200).send({ user: { identityId: result.identityId } });
      } else {
        return rep.code(404).send({ code: "USER_NOT_FOUND" });
      }


    },
  );
});
