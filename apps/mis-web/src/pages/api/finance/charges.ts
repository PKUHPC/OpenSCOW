import { route } from "@ddadaal/next-typed-api-routes-runtime";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { moneyToNumber } from "@scow/lib-decimal";
import { authenticate } from "src/auth/server";
import { ChargingServiceClient } from "src/generated/server/charging";
import { UserRole } from "src/models/User";
import { ensureNotUndefined } from "src/utils/checkNull";
import { getClient } from "src/utils/client";

export interface ChargeInfo {
  index: number;
  accountName: string;
  time: string;
  type: string;
  amount: number;
  comment: string;
}

export interface GetChargesSchema {
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

    accountName: string;
  };

  responses: {
    200: {
      results: ChargeInfo[];
      total: number;
    }
  }
}

export default route<GetChargesSchema>("GetChargesSchema", async (req, res) => {
  const { endTime, startTime, accountName } = req.query;

  const auth = authenticate((i) =>
    i.accountAffiliations.some((x) => x.accountName === accountName && x.role !== UserRole.USER));

  const info = await auth(req, res);

  if (!info) { return; }

  const client = getClient(ChargingServiceClient);

  const reply = ensureNotUndefined(await asyncClientCall(client, "getChargeRecords", {
    accountName,
    startTime,
    endTime,
    tenantName: info.tenant,
  }), ["total"]);

  const accounts = reply.results.map((x) => {
    const obj = ensureNotUndefined(x, ["time", "amount", "accountName"]);

    return {
      ...obj,
      amount: moneyToNumber(obj.amount),
    };
  });

  return {
    200: {
      results: accounts,
      total: moneyToNumber(reply.total),
    },
  };
});
