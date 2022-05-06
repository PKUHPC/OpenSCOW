import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";
import { ChangePasswordResult } from "src/auth/AuthProvider";

const BodySchema = Type.Object({
  identityId: Type.String({ description: "用户ID" }),
  oldPassword: Type.String({ description: "原密码" }),
  newPassword: Type.String({ description: "新密码" }),
});

const ResponsesSchema = Type.Object({
  204: Type.Null({ description: "修改完成" }),
  404: Type.Null({ description: "用户未找到" }),
  412: Type.Null({ description: "原密码不正确" }),
  501: Type.Null({ description: "当前配置不支持修改密码" }),
});

const codes: Record<ChangePasswordResult, number> = {
  NotFound: 404,
  NotImplemented: 501,
  OK: 204,
  WrongOldPassword: 412,
};

/**
 * 修改密码
 */
export const changePasswordRoute = fp(async (f) => {
  f.patch<{
    Body: Static<typeof BodySchema>
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/password",
    {
      schema: {
        body: BodySchema,
        response: ResponsesSchema.properties,
      },
    },
    async (req, rep) => {

      const { identityId, newPassword, oldPassword } =  req.body;

      const result = await f.auth.changePassword(identityId, oldPassword, newPassword, req);

      await rep.code(codes[result]).send(null);
    },
  );
});
