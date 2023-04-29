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
import { validateToken } from "src/auth/token";
import type { PlatformRole, TenantRole, UserRole } from "src/models/User";

// ts-json-schema-generator fails to generate from Static<typeof UserInfoSchema>
// Write another plain UserInfo;
export interface UserInfo {
  identityId: string;
  tenant: string;
  name?: string;
  accountAffiliations: { accountName: string; role: UserRole }[];
  platformRoles: PlatformRole[];
  tenantRoles: TenantRole[];
}

export interface ValidateTokenSchema {
  method: "GET";

  query: { token: string }

  responses: {
    200: UserInfo;
    403: null;
  }

}

export default route<ValidateTokenSchema>("ValidateTokenSchema", async (req) => {

  const { token } = req.query;

  const info = await validateToken(token);

  if (!info) { return { 403: null }; }

  return { 200: info };

});


