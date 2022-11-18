import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { changePassword as libChangePassword } from "@scow/lib-auth"; 
import { authenticate } from "src/auth/server";
import { GetUserInfoReply, UserServiceClient } from "src/generated/server/user";
import { TenantRole } from "src/models/User";
import { getClient } from "src/utils/client";
import { publicConfig, runtimeConfig } from "src/utils/config";

// 此API用于租户管理员修改自己租户的用户密码
// 没有权限返回undefined
export interface ChangePasswordAsTenantAdminSchema {

  method: "PATCH";

  body: {
    identityId: string;
    oldPassword: string;
    /**
     * @pattern ^(?=.*\d)(?=.*[a-zA-Z])(?=.*[`~!@#\$%^&*()_+\-[\];',./{}|:"<>?]).{8,}$
     */
    newPassword: string;
  };

  responses: {
    /** 更改成功 */
    204: null;

    /** 用户未找到 */
    404: null;

    /** 密码不正确 */
    412: null;
    
    /** 本功能在当前配置下不可用。 */
    501: null;
  }
}


export default /* #__PURE__*/route<ChangePasswordAsTenantAdminSchema>(
  "ChangePasswordAsTenantAdminSchema", async (req, res) => {

    if (!publicConfig.ENABLE_CHANGE_PASSWORD) {
      return { 501: null };
    }
    
    const { identityId, newPassword, oldPassword } = req.body;

    const client = getClient(UserServiceClient);
    const userInfo: GetUserInfoReply = await asyncClientCall(client, "getUserInfo", {
      userId: identityId,
    });
    if (!userInfo) {
      return { 404: null };
    }
    // 鉴权，要求用户所在的租户应该为当前租户管理员
    const auth = authenticate((info) => 
      (info.tenantRoles.includes(TenantRole.TENANT_ADMIN)) && (userInfo.tenantName === info.tenant));

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    return await libChangePassword(runtimeConfig.AUTH_INTERNAL_URL, { identityId, newPassword, oldPassword }, console)
      .then(() => ({ 204: null }))
      .catch((e) => ({ [e.status]: null }));
  });
