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
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { PayRecord } from "src/entities/PayRecord";
import { Tenant } from "src/entities/Tenant";
import { CHARGE_TYPE_OTHERS } from "src/utils/constants";


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
    /**
     *
     * case tenant:返回这个租户（tenantName）的充值记录
     * case allTenants: 返回该所有租户充值记录
     * case accountOfTenant: 返回该这个租户（tenantName）下这个账户（accountName）的充值记录
     * case accountsOfTenant: 返回这个租户（tenantName）下所有账户的充值记录
     *
     * @returns
     */
    getPaymentRecords: async ({ request, em }) => {

      const { endTime, startTime, target } =
      ensureNotUndefined(request, ["startTime", "endTime", "target"]);
      let searchParam = {};
      switch (target?.$case)
      {
      case "tenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName:undefined };
        break;
      case "allTenants":
        searchParam = { accountName:undefined };
        break;
      case "accountOfTenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName:target[target.$case].accountName };
        break;
      case "accountsOfTenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName:{ $ne:null } };
        break;
      default:
        searchParam = {};
      }

      const records = await em.find(PayRecord, {
        time: { $gte: startTime, $lte: endTime },
        ...searchParam,
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
    /**
     *
     * case tenant:返回这个租户（tenantName）的消费记录
     * case allTenants: 返回所有租户消费记录
     * case accountOfTenant: 返回这个租户（tenantName）下这个账户（accountName）的消费记录
     * case accountsOfTenant: 返回这个租户（tenantName）下所有账户的消费记录
     * case accountsOfAllTenants: 返回所有租户下所有账户的消费记录
     *
     * @returns
     */
    getChargeRecords: async ({ request, em }) => {
      const { startTime, endTime, type, target }
        = ensureNotUndefined(request, ["startTime", "endTime"]);

      let searchParam: { tenantName?: string, accountName?: string | { $ne: null } } = {};
      switch (target?.$case)
      {
      // 当前租户的租户消费记录
      case "tenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName: undefined };
        break;
        // 所有租户的租户消费记录
      case "allTenants":
        searchParam = { accountName: undefined };
        break;
        // 当前租户下当前账户的消费记录
      case "accountOfTenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName: target[target.$case].accountName };
        break;
        // 当前租户下所有账户的消费记录
      case "accountsOfTenant":
        searchParam = { tenantName: target[target.$case].tenantName, accountName: { $ne:null } };
        break;
        // 所有租户下所有账户的消费记录
      case "accountsOfAllTenants":
        searchParam = { accountName: { $ne:null } };
        break;
      default:
        searchParam = {};
      }

      // 可查询的types类型
      const typesToSearch = misConfig.customChargeTypes && misConfig.customChargeTypes.length > 0 ? [
        misConfig.jobChargeType,
        misConfig.changeJobPriceType,
        ...misConfig.customChargeTypes,
      ] : [
        misConfig.jobChargeType,
        misConfig.changeJobPriceType,
      ];

      let searchType = {};
      if (!type) {
        searchType = { type: { $ne: null } };
      } else {
        if (type === CHARGE_TYPE_OTHERS) {
          searchType = { type: { $nin: typesToSearch } };
        } else {
          searchType = { type: type };
        }
      }

      const records = await em.find(ChargeRecord, {
        time: { $gte: startTime, $lte: endTime },
        ...searchType,
        ...searchParam,
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
