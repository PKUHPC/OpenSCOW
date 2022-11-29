/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { changePassword as libChangePassword } from "@scow/lib-auth"; 
import { authenticate } from "src/auth/server";
import { PlatformRole } from "src/models/User";
import { publicConfig, runtimeConfig } from "src/utils/config";

// 此API用于账户管理员修改其他任意用户的密码。
// 没有权限返回undefined
export interface ChangePasswordAsPlatformAdminSchema {

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


export default /* #__PURE__*/route<ChangePasswordAsPlatformAdminSchema>(
  "ChangePasswordAsPlatformAdminSchema", async (req, res) => {

    if (!publicConfig.ENABLE_CHANGE_PASSWORD) {
      return { 501: null };
    }

    const auth = authenticate((info) => info.platformRoles.includes(PlatformRole.PLATFORM_ADMIN));

    const info = await auth(req, res);

    if (!info) { return; }

    const { identityId, newPassword, oldPassword } = req.body;

    return await libChangePassword(runtimeConfig.AUTH_INTERNAL_URL, { identityId, newPassword, oldPassword }, console)
      .then(() => ({ 204: null }))
      .catch((e) => ({ [e.status]: null }));

  });
