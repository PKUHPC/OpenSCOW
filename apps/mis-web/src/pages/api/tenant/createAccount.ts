import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { authenticate } from "src/auth/server";
import { AccountServiceClient } from "src/generated/server/account";
import { TenantRole } from "src/models/User";
import { checkNameMatch } from "src/server/checkIdNameMatch";
import { getClient } from "src/utils/client";
import { publicConfig } from "src/utils/config";
import { handlegRPCError } from "src/utils/server";

export interface CreateAccountSchema {
  method: "POST";

  body: {
    /**
     * 账户名
     * @pattern ^[a-z0-9_]+$
     */
    accountName: string;
    ownerId: string;
    ownerName: string;
    comment: string;
  }

  responses: {
    200: null;
    400: {
      code: "ID_NAME_NOT_MATCH" | "ACCOUNT_NAME_NOT_VALID";
    }
    /** ownerId不存在 */
    404: null;
    409: null;
  }
}

const accountNameRegex = publicConfig.ACCOUNT_NAME_PATTERN ? new RegExp(publicConfig.ACCOUNT_NAME_PATTERN) : undefined;

const auth = authenticate((info) => info.tenantRoles.includes(TenantRole.TENANT_ADMIN));

export default route<CreateAccountSchema>("CreateAccountSchema",
  async (req, res) => {

    const info = await auth(req, res);
    if (!info) {
      return;
    }

    const { accountName, ownerId, ownerName, comment } = req.body;

    if (accountNameRegex && !accountNameRegex.test(accountName)) {
      return { 400: {
        code: "ACCOUNT_NAME_NOT_VALID",
        message: `Account name must match ${publicConfig.ACCOUNT_NAME_PATTERN}`,
      } };
    }

    // check whether id and name matches
    const result = await checkNameMatch(ownerId, ownerName);

    if (result === "NotFound") {
      return { 404: null };
    }

    if (result === "NotMatch") {
      return { 400: { code: "ID_NAME_NOT_MATCH" } };
    }

    const client = getClient(AccountServiceClient);

    return await asyncClientCall(client, "createAccount", {
      accountName, ownerId, comment, tenantName: info.tenant,
    })
      .then(() => ({ 200: null }))
      .catch(handlegRPCError({
        [Status.ALREADY_EXISTS]: () => ({ 409: null }),
        [Status.NOT_FOUND]: () => ({ 404: null }),
      }));
  });
