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

import { ensureNotUndefined, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { LockMode, QueryOrder } from "@mikro-orm/core";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { ChargingServiceServer, ChargingServiceService } from "@scow/protos/build/server/charging";
import { charge, pay } from "src/bl/charging";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";


export const chargingServiceServer = plugin((server) => {

  server.addService<ChargingServiceServer>(ChargingServiceService, {

    getBalance: async ({ request, em }) => {
      const { tenantName, accountName } = request;

      const entity = accountName === undefined
        ? await em.findOne(Tenant, { name: tenantName })
        : await em.findOne(Account, { tenant: { name: tenantName }, accountName });

      if (!entity) {
        if (accountName === undefined) {
          throw <ServiceError>{
            code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found`,
          };
        } else {
          throw <ServiceError>{
            code: status.NOT_FOUND, message: `Tenant ${tenantName} or account  ${accountName} is not found`,
          };
        }
      }

      return [{ balance: decimalToMoney(entity.balance) }];
    },

    pay: async ({ request, em, logger }) => {
      const {
        accountName, tenantName, type, amount, comment, ipAddress, operatorId,
      } = ensureNotUndefined(request, ["amount"]);

      const reply = await em.transactional(async (em) => {

        const target = accountName !== undefined
          ? await em.findOne(Account, { tenant: { name: tenantName }, accountName: accountName }, {
            lockMode: LockMode.PESSIMISTIC_WRITE,
            populate: ["tenant"],
          })
          : await em.findOne(Tenant, { name: tenantName }, {
            lockMode: LockMode.PESSIMISTIC_WRITE,
          });

        if (!target) {
          if (accountName === undefined) {
            throw <ServiceError>{
              code: status.NOT_FOUND, message: `Tenant  ${tenantName} is not found`,
            };
          } else {
            throw <ServiceError>{
              code: status.NOT_FOUND, message: `Account ${accountName} or tenant ${tenantName} is not found`,
            };
          }

        }

        return await pay({
          amount: new Decimal(moneyToNumber(amount)),
          comment,
          target,
          type,
          ipAddress,
          operatorId,
        }, em, logger, server.ext);
      });

      return [{
        currentBalance: decimalToMoney(reply.currentBalance),
        previousBalance: decimalToMoney(reply.previousBalance),
      }];
    },


    charge: async ({ request, em, logger }) => {

      const { accountName, type, amount, comment, tenantName } = ensureNotUndefined(request, ["amount"]);

      const reply = await em.transactional(async (em) => {
        const target = accountName !== undefined
          ? await em.findOne(Account, { tenant: { name: tenantName }, accountName: accountName }, {
            populate: ["tenant"],
            lockMode: LockMode.PESSIMISTIC_WRITE,
          })
          : await em.findOne(Tenant, { name: tenantName }, {
            lockMode: LockMode.PESSIMISTIC_WRITE,
          });

        if (!target) {
          if (accountName === undefined) {
            throw <ServiceError>{
              code: status.NOT_FOUND, message: `Tenant  ${tenantName} is not found`,
            };
          } else {
            throw <ServiceError>{
              code: status.NOT_FOUND, message: `Account  ${accountName} or tenant  ${tenantName} is not found`,
            };
          }
        }

        return await charge({
          amount: new Decimal(moneyToNumber(amount)),
          comment,
          target,
          type,
        }, em, logger, server.ext);
      });

      return [{
        currentBalance: decimalToMoney(reply.currentBalance),
        previousBalance: decimalToMoney(reply.previousBalance),
      }];
    },

    getAllPayTypes: async ({ em }) => {
      const result: { type: string }[] = await em.createQueryBuilder(PayRecord, "c")
        .select("type", true)
        .execute("all");

      return [{ types: result.map((x) => x.type) }];
    },

    getPaymentRecords: async ({ request, em }) => {

      const { tenantName, accountName, endTime, startTime } = ensureNotUndefined(request, ["startTime", "endTime"]);

      const records = await em.find(PayRecord, {
        time: { $gte: startTime, $lte: endTime }, accountName,
        ...tenantName !== undefined ? { tenantName } : {},
      }, { orderBy: { time: QueryOrder.DESC } });

      return [{
        results: records.map((x) => ({
          tenantName: x.tenantName,
          accountName: x.accountName,
          amount: decimalToMoney(x.amount),
          comment: x.comment,
          index: x.id,
          ipAddress: x.ipAddress,
          time: x.time.toISOString(),
          type: x.type,
          operatorId: x.operatorId,
        })),
        total: decimalToMoney(records.reduce((prev, curr) => prev.plus(curr.amount), new Decimal(0))),
      }];
    },

    getChargeRecords: async ({ request, em }) => {
      const { tenantName, accountName, endTime, startTime } = ensureNotUndefined(request, ["startTime", "endTime"]);

      const records = await em.find(ChargeRecord, {
        time: { $gte: startTime, $lte: endTime },
        ...accountName !== undefined ? { accountName } : {},
        ...tenantName !== undefined ? { tenantName } : {},
      }, { orderBy: { time: QueryOrder.DESC } });

      return [{
        results: records.map((x) => ({
          tenantName: x.tenantName,
          accountName: x.accountName,
          amount: decimalToMoney(x.amount),
          comment: x.comment,
          index: x.id,
          time: x.time.toISOString(),
          type: x.type,
        })),
        total: decimalToMoney(records.reduce((prev, curr) => prev.plus(curr.amount), new Decimal(0))),
      }];
    },
  });

});
