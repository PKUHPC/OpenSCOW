import { Static, Type } from "@sinclair/typebox";
import fp from "fastify-plugin";

const CapabilitiesSchema = Type.Object({
  createUser: Type.Boolean({ description: "是否可以创建用户" }),
  changePassword: Type.Boolean({ description: "是否可以修改密码" }),
  validateName: Type.Boolean({ description: "是否可以验证用户名的密码" }),
  getUser: Type.Boolean({ description: "是否可以查询用户" }),
});

export type Capabilities = Static<typeof CapabilitiesSchema>;

const ResponsesSchema = Type.Object({
  200: CapabilitiesSchema,
});


export const getCapabilitiesRoute = fp(async (f) => {
  f.get<{
    Querystring: {},
    Responses: Static<typeof ResponsesSchema>,
  }>(
    "/capabilities",
    {
      schema: {
        response: ResponsesSchema.properties,
      },
    },
    async () => {

      const provider = f.auth;

      return {
        createUser: provider.createUser !== undefined,
        validateName: provider.validateName !== undefined,
        changePassword: provider.changePassword !== undefined,
        getUser: provider.getUser !== undefined,
      };
    },
  );
});
