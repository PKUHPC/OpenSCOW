import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { status } from "@grpc/grpc-js";
import { authenticate } from "src/auth/server";
import { UserServiceClient } from "src/generated/server/user";
import { PlatformRole, UserRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";

export interface CreateUserSchema {
  method: "POST";

  body: {
    /**
     * 用户ID
     * @pattern ^[a-z0-9_]+$
     */

    identityId: string;
    name: string;
    email: string;

    /**
     * 密码
     * @pattern ^(?=.*\d)(?=.*[a-zA-Z])(?=.*[`~!@#\$%^&*()_+\-[\];',./{}|:"<>?]).{8,}$
     */
    password: string;
  }

  responses: {
    204: null;

    /** 用户已经存在 */
    409: null;

    /** 本功能在当前配置下不可用 */
    501: null;
  }
}

export default /* #__PURE__*/route<CreateUserSchema>("CreateUserSchema", async (req, res) => {

  if (!publicConfig.ENABLE_CREATE_USER) {
    return { 501: null };
  }

  const { email, identityId, name, password } = req.body;

  const auth = authenticate((u) =>
    u.platformRoles.includes(PlatformRole.PLATFORM_ADMIN) ||
    u.accountAffiliations.some((x) => x.role !== UserRole.USER),
  );

  const info = await auth(req, res);

  if (!info) { return; }

  // create user on server
  const client = getClient(UserServiceClient);

  return await asyncClientCall(client, "createUser", {
    identityId,
    email: email,
    name: name,
    password,
    tenantName: info.tenant,
  })
    .then(() => ({ 204: null }))
    .catch(handlegRPCError({
      [status.ALREADY_EXISTS]: () => ({ 409: null }),
    }));
});
