import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { validateToken } from "src/auth/token";
import type { PlatformRole, TenantRole, UserRole } from "src/models/User";

// ts-json-schema-generator fails to generate from Static<typeof UserInfoSchema>
// Write another plain UserInfo;
export interface UserInfo {
  identityId: string;
  tenant: string;
  name: string;
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


