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
import { QueryOrder } from "@mikro-orm/core";
import { StatisticServiceServer, StatisticServiceService } from "@scow/protos/build/audit/statistic";
import { OperationLog } from "src/entities/OperationLog";
import { generateDateRangeArray } from "src/utils/statistic";


export const statisticServiceServer = plugin((server) => {

  server.addService<StatisticServiceServer>(StatisticServiceService, {

    getNewUserCount: async ({ request, em }) => {

      const { startTime, endTime } = ensureNotUndefined(request, ["startTime", "endTime"]);

      const days = generateDateRangeArray(startTime, endTime);

      const results = await Promise.all(days.map(async ({ startDate, endDate }) => {
        const count = await em.count(OperationLog, {
          $and: [
            ...([{ operationTime: { $gte: startDate } }]),
            ...([{ operationTime: { $lte: endDate } }]),
          ],
        });
        return {
          date: startDate,
          count,
        };
      }));

      return [{
        results,
      }];
    },

    getActiveUserCount: async ({ request, em }) => {

      const { startTime, endTime } = ensureNotUndefined(request, ["startTime", "endTime"]);

      const days = generateDateRangeArray(startTime, endTime);

      const qb = em.createQueryBuilder(OperationLog);

      const results = await Promise.all(days.map(async ({ startDate, endDate }) => {

        const [{ count }] = await qb.count("operator_user_id", true)
          .where({ operationTime: { $gte: startDate } })
          .andWhere({ operationTime: { $lte: endDate } }).execute();

        return {
          date: startDate,
          count,
        };

      }));

      return [{
        results,
      }];
    },


    getTopSubmitJobUsers: async ({ request, em }) => {
      const { startTime, endTime, topRank = 10 } = ensureNotUndefined(request, ["startTime", "endTime"]);
      const qb = em.createQueryBuilder(OperationLog);
      const results: {userId: string, submitJobCount: number}[]
      = await qb
        .select(["`operator_user_id` as `userId`", "count(`operator_user_id`) as `submit_count`"])
        .where({ operationTime: { $gte: startTime } })
        .andWhere({ operationTime: { $lte: endTime } })
        .andWhere({ metaData: { submitJob: { $ne: null } } })
        .groupBy("o.operator_user_id")
        .orderBy({ submitCount: QueryOrder.DESC })
        .limit(topRank)
        .execute();

      return [{
        results,
      }];
    },

    getNewJobCount: async ({ request, em }) => {

      const { startTime, endTime } = ensureNotUndefined(request, ["startTime", "endTime"]);

      const days = generateDateRangeArray(startTime, endTime);

      const results = await Promise.all(days.map(async ({ startDate, endDate }) => {
        const count = await em.count(OperationLog, {
          $and: [
            ...([{ operationTime: { $gte: startDate } }]),
            ...([{ operationTime: { $lte: endDate } }]),
          ],
          metaData: {
            submitJob: { $ne: null },
          },
        });
        return {
          date: startDate,
          count,
        };
      }));

      return [{
        results,
      }];

    },

  });

});
