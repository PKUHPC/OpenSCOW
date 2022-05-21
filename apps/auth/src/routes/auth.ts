import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { AUTH_REDIRECT_URL } from "src/config/env";

const QuerystringSchema = Type.Object({
  callbackUrl: Type.Optional(Type.String()),
});

/**
 * 发起登录请求，将会返回一个HTML，HTML加载后会重定向至IAAA登录界面
 */
export const authRoute = fp(async (f) => {
  f.get<{ Querystring: Static<typeof QuerystringSchema> }>(
    "/public/auth",
    {
      schema: {
        querystring: QuerystringSchema,
      },
    },
    async (req, rep) => {
      await f.auth.serveLoginHtml(req.query.callbackUrl ?? AUTH_REDIRECT_URL, req, rep);
    },
  );
});
