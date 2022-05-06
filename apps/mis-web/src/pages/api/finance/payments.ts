import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { moneyToNumber } from "@scow/lib-decimal";
import { authenticate } from "src/auth/server";
import { ChargingServiceClient } from "src/generated/server/charging";
import { TenantRole, UserInfo, UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export interface PaymentInfo {
  index: number;
  accountName: string;
  time: string;
  type: string;
  amount: number;
  comment: string;
  ipAddress: string;
  operatorId: string;
}

export interface GetPaymentsSchema {
  method: "GET";

  query: {
    /**
     * @format date-time
     */
    startTime: string;

    /**
     * @format date-time
     */
    endTime: string;

    accountName?: string;
  };

  responses: {
    200: {
      results: PaymentInfo[];
      total: number;
    }
  }
}

export default route<GetPaymentsSchema>("GetPaymentsSchema", async (req, res) => {

  const { endTime, startTime, accountName } = req.query;

  const client = getClient(ChargingServiceClient);

  let user: UserInfo | undefined;

  // check whether the user can access the account
  if (accountName) {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE)
      || i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER),
    )(req, res);
    if (!user) { return; }
  } else {
    user = await authenticate((i) =>
      i.tenantRoles.includes(TenantRole.TENANT_FINANCE),
    )(req, res);
    if (!user) { return; }
  }

  const reply = ensureNotUndefined(await asyncClientCall(client, "getPaymentRecords", {
    tenantName: user.tenant,
    accountName,
    startTime,
    endTime,
  }), ["total"]);

  const returnAuditInfo = user.tenantRoles.includes(TenantRole.TENANT_FINANCE);

  const accounts = reply.results.map((x) => {
    const obj = ensureNotUndefined(x, ["time", "amount"]);

    return {
      accountName: obj.accountName,
      comment: obj.comment,
      index: obj.index,
      ipAddress: returnAuditInfo ?  obj.ipAddress : "",
      operatorId: returnAuditInfo ? obj.operatorId : "",
      time: obj.time,
      type: obj.type,
      amount: moneyToNumber(obj.amount),
    } as PaymentInfo;
  });

  return {
    200: {
      results: accounts,
      total: moneyToNumber(reply.total),
    },
  };
});
