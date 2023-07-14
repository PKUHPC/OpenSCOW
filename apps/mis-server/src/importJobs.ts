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

import { asyncClientCall } from "@ddadaal/tsgrpc-client";
import { Logger, Server } from "@ddadaal/tsgrpc-server";
import { Loaded, MikroORM, Options } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { parsePlaceholder } from "@scow/lib-config";
import { Decimal } from "@scow/lib-decimal";
import { JobInfo as ClusterJobInfo } from "@scow/scheduler-adapter-protos/build/protos/job";
import { emptyJobPriceInfo } from "src/bl/jobPrice";
import { createPriceMap, PriceMap } from "src/bl/PriceMap";
import { config } from "src/config/env";
import { misConfig } from "src/config/mis";
import { entities } from "src/entities";
import { Account } from "src/entities/Account";
import { ChargeRecord } from "src/entities/ChargeRecord";
import { JobInfo } from "src/entities/JobInfo";
import { Tenant } from "src/entities/Tenant";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin, clustersPlugin } from "src/plugins/clusters";
import { logger } from "src/utils/logger";

export const ormConfigs = {
  host: misConfig.db.host,
  port: misConfig.db.port,
  user: misConfig.db.user,
  dbName: config.DB_NAME ?? misConfig.db.dbName,
  password: config.DB_PASSWORD ?? misConfig.db.password,
  // host: "192.168.88.100",
  // port: 3308,
  // user: "root",
  // dbName: "scow",
  // password: "must!chang3this",
  type: "mysql",
  forceUndefined: true,
  runMigrations: false,
  entities,
  debug: misConfig.db.debug,
} as Options<MySqlDriver>;

async function main() {

  const server = new Server({ logger });

  server.logger.info("start import jobs");

  await server.register(clustersPlugin);

  const orm = await MikroORM.init<MySqlDriver>({
    ...ormConfigs,
    logger: (msg) => server.logger.info(msg),
  });

  const priceMap = await createPriceMap(orm.em.fork(), server.ext.clusters, server.logger);

  const args = process.argv.slice(1);

  if (args.length === 4) {
    const [_scriptName, cluster, start, end] = args;

    await importJobs(orm.em.fork(), server.logger, server.ext, priceMap,
      { cluster, startTime: new Date(Number.parseInt(start)), endTime: new Date(Number.parseInt(end)) });
  }


  await orm.close();
  server.logger.info("db closed");
}

async function importJobs(
  em: SqlEntityManager,
  logger: Logger,
  clusterPlugin: ClusterPlugin,
  priceMap: PriceMap,
  params: { cluster: string, startTime: Date, endTime: Date },
) {
  logger.info("start import jobs");

  const { cluster, startTime, endTime } = params;

  const accounts = await em.find(Account, { }, { populate: ["tenant"]});

  const accountTenantMap = new Map(accounts.map((x) => [x.accountName, x.tenant.$.name]));

  const persistJobAndCharge = async (jobs: ClusterJobInfo[]) => {
    const result = await em.transactional(async (em) => {
      // Calculate prices for new info and persist
      // const pricedJobs = [] as JobInfo[];
      const pricedJobs = jobs.map((job) => {
        const tenant = accountTenantMap.get(job.account);

        if (!tenant) {
          logger.warn("Account %s doesn't exist. Doesn't charge the job.", job.account);
        }
        const price = tenant ?
          (() => {
            try {
              return priceMap.calculatePrice({
                jobId: job.jobId,
                cluster,
                cpusAlloc: job.cpusAlloc!,
                gpu: job.gpusAlloc!,
                memAlloc: job.memAllocMb!,
                memReq: job.memReqMb,
                partition: job.partition,
                qos: job.qos,
                timeUsed: job.elapsedSeconds!,
                account: job.account,
                tenant,
              });
            } catch (e) {
              logger.warn(`error when calculate price. job id: ${job.jobId}. Doesn't calculate price`);
              return emptyJobPriceInfo();
            }
          }) ()
          : emptyJobPriceInfo();

        const pricedJob = new JobInfo({ cluster, ...job }, tenant, price);

        em.persist(pricedJob);

        return pricedJob;
      });

      await Promise.all(pricedJobs
        .map(async (x) => {
        // add job charge for the user
          const ua = await em.findOne(UserAccount, {
            account: { accountName: x.account },
            user: { userId: x.user },
          }, {
            populate: ["user", "account", "account.tenant"],
          });

          if (!ua) {
            logger.warn({ biJobIndex: x.biJobIndex },
              "User %s in account %s is not found. Don't charge the job.", x.user, x.account);
          }

          const comment = parsePlaceholder(misConfig.jobChargeComment, x);

          if (ua) {
          // charge account
            await charge({
              amount: x.accountPrice,
              type: misConfig.jobChargeType,
              comment,
              target: ua.account.$,
            }, em);

            // charge tenant
            await charge({
              amount: x.tenantPrice,
              type: misConfig.jobChargeType,
              comment,
              target: ua.account.$.tenant.getEntity(),
            }, em);
          }

        }));

      return pricedJobs.length;

    });

    em.clear();

    return result;
  };

  const fields: string[] = [
    "job_id", "name", "user", "account", "cpus_alloc", "gpus_alloc", "mem_alloc_mb", "mem_req_mb",
    "partition", "qos", "elapsed_seconds", "node_list", "nodes_req", "nodes_alloc", "time_limit_minutes",
    "submit_time", "start_time", "end_time",
  ];
  const fetchWithinTimeRange = async (startDate: Date, endDate: Date, batchSize: number) => {

    // calculate totalCount between startDate and endDate
    const totalCount = await clusterPlugin.clusters.callOnOne(cluster, logger, async (client) =>
      await asyncClientCall(client.job, "getJobs", {
        fields,
        filter: {
          users: [], accounts: [], states: [],
          endTime: { startTime: startDate?.toISOString(), endTime: endDate.toISOString() },
        },
        pageInfo: { page: 1, pageSize: 1 },
      }),
    ).then((result) => {
      return result.totalCount!;
    });

    if (totalCount <= batchSize) {
      const jobsInfo: ClusterJobInfo[] = [];
      jobsInfo.push(...(await clusterPlugin.clusters.callOnOne(cluster, logger, async (client) =>
        await asyncClientCall(client.job, "getJobs", {
          fields,
          filter: {
            users: [], accounts: [], states: [],
            endTime: { startTime: startDate?.toISOString(), endTime: endDate.toISOString() },
          },
        }),
      ).then((value) => {
        return value.jobs.filter((x) => x.startTime && new Date(x.startTime) <= new Date(x.endTime!));
      })));

      const savedJobsCount = await persistJobAndCharge(jobsInfo);


      logger.info(`Completed. Saved ${savedJobsCount} new info.`);
      return savedJobsCount;

    } else {
      const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
      const firstHalfJobsCount = await fetchWithinTimeRange(startDate, midDate, batchSize);
      const secondHalfJobsCount = await fetchWithinTimeRange(new Date(midDate.getTime() + 1000), endDate, batchSize);
      return firstHalfJobsCount + secondHalfJobsCount;
    }

  };

  const newJobsCount = await fetchWithinTimeRange(startTime, endTime, 10000);

  logger.info(`import completed, saved ${newJobsCount} jobs`);
}

type ChargeRequest = {
  target: Loaded<Account, "tenant"> | Tenant;
  amount: Decimal;
  comment: string;
  type: string;
};
export async function charge(
  request: ChargeRequest, em: SqlEntityManager,
) {
  const { target, amount, comment, type } = request;

  const record = new ChargeRecord({
    time: new Date(),
    type,
    target,
    comment,
    amount,
  });

  em.persist(record);
}

main();
