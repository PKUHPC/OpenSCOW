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
import { Logger } from "@ddadaal/tsgrpc-server";
import { QueryOrder } from "@mikro-orm/core";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { parsePlaceholder } from "@scow/lib-config";
import { GetJobsResponse, JobInfo as ClusterJobInfo } from "@scow/scheduler-adapter-protos/build/protos/job";
import { addJobCharge, charge } from "src/bl/charging";
import { emptyJobPriceInfo } from "src/bl/jobPrice";
import { clusters } from "src/config/clusters";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { JobInfo } from "src/entities/JobInfo";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { callHook } from "src/plugins/hookClient";
import { PricePlugin } from "src/plugins/price";
import { toGrpc } from "src/utils/job";

async function getClusterLatestDate(em: SqlEntityManager, cluster: string, logger: Logger) {

  const query = em.fork().createQueryBuilder(JobInfo)
    .select("timeEnd")
    .where({ cluster })
    .orderBy({ timeEnd: QueryOrder.DESC });

  const { timeEnd = undefined } = (await query.execute("get")) ?? {};

  logger.info(`Latest fetched job's end_time is ${timeEnd}.`);

  return timeEnd;
}

const processGetJobsResult = (cluster: string, result: GetJobsResponse) => {
  const jobs: ({cluster: string} & ClusterJobInfo)[] = [];
  result.jobs.forEach((job) => {
    jobs.push({ cluster, ...job });
  });

  // sort by end time
  jobs.sort((a, b) => {
    const endTimeA = new Date(a.endTime!).getTime();
    const endTimeB = new Date(b.endTime!).getTime();
    return endTimeA - endTimeB;
  });

  // filter jobs without start time
  return jobs.filter((x) => x.startTime);
};

export let lastFetched: Date | null = null;

export async function fetchJobs(
  em: SqlEntityManager,
  logger: Logger,
  clusterPlugin: ClusterPlugin,
  pricePlugin: PricePlugin,
) {
  logger.info("Start fetching.");

  logger.info("Loading Tenant Account associations");

  const accounts = await em.find(Account, { }, { populate: ["tenant"]});

  const accountTenantMap = new Map(accounts.map((x) => [x.accountName, x.tenant.$.name]));

  const priceMap = await pricePlugin.price.createPriceMap();

  const persistJobAndCharge = async (jobs: ({ cluster: string } & ClusterJobInfo)[]) => {
    const result = await em.transactional(async (em) => {
      // Calculate prices for new info and persist
      const pricedJobs: JobInfo[] = [];
      let pricedJob: JobInfo;
      for (const job of jobs) {
        const tenant = accountTenantMap.get(job.account);

        if (!tenant) {
          logger.warn("Account %s doesn't exist. Doesn't charge the job.", job.account);
        }

        try {
          const price = tenant ? await priceMap.calculatePrice({
            jobId: job.jobId,
            cluster: job.cluster,
            cpusAlloc: job.cpusAlloc!,
            gpu: job.gpusAlloc!,
            memAlloc: job.memAllocMb!,
            memReq: job.memReqMb,
            partition: job.partition,
            qos: job.qos,
            timeUsed: job.elapsedSeconds!,
            account: job.account,
            tenant,
          }) : emptyJobPriceInfo();

          pricedJob = new JobInfo(job, tenant, price);

          em.persist(pricedJob);

          // Determine whether the job can be inserted into the database. If not, skip the job
          await em.flush();

        } catch (error) {
          logger.warn("invalid job. cluster: %s, jobId: %s, error: %s", job.cluster, job.jobId, error);
          continue;
        }

        const account = await em.findOne(Account, {
          accountName: pricedJob.account,
        }, {
          populate: ["tenant"],
        });

        if (!account) {
          logger.warn({ biJobIndex: pricedJob.biJobIndex },
            "Account %s is not found. Don't charge the job.", pricedJob.account);
        }

        const comment = parsePlaceholder(misConfig.jobChargeComment, pricedJob);

        if (account) {
          // charge account
          await charge({
            amount: pricedJob.accountPrice,
            type: misConfig.jobChargeType,
            comment,
            target: account,
          }, em, logger, clusterPlugin);

          // charge tenant
          await charge({
            amount: pricedJob.tenantPrice,
            type: misConfig.jobChargeType,
            comment,
            target: account.tenant.$,
          }, em, logger, clusterPlugin);

          const ua = await em.findOne(UserAccount, {
            account: { accountName: pricedJob.account },
            user: { userId: pricedJob.user },
          }, {
            populate: ["user", "account"],
          });

          if (!ua) {
            logger.warn({ biJobIndex: pricedJob.biJobIndex },
              "User %s in account %s is not found.", pricedJob.user, pricedJob.account);
          } else {
            // 用户限额及相关操作
            await addJobCharge(ua, pricedJob.accountPrice, clusterPlugin, logger);
          }

        }

        pricedJobs.push(pricedJob);
      }
      return pricedJobs.map(toGrpc);
    });

    em.clear();

    await callHook("jobsSaved", {
      jobs: result,
    }, logger);

    return result.length;
  };

  try {
    let newJobsCount = 0;
    for (const cluster of Object.keys(clusters)) {
      logger.info(`fetch jobs from cluster ${cluster}`);

      const latestDate = await getClusterLatestDate(em, cluster, logger);
      const nextDate = latestDate && new Date(latestDate.getTime() + 1000);
      const configDate: Date | undefined =
      (misConfig.fetchJobs.startDate && new Date(misConfig.fetchJobs.startDate)) as Date | undefined;

      const startFetchDate = (nextDate && configDate)
        ? (nextDate > configDate ? nextDate : configDate)
        : (nextDate || configDate);
      const endFetchDate = new Date();
      logger.info(`Fetching new info which end_time is from ${startFetchDate} to ${endFetchDate}`);

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
        ).then((result) => result.totalCount!);

        if (totalCount <= batchSize) {
          const jobsInfo = await clusterPlugin.clusters.callOnOne(cluster, logger, async (client) =>
            await asyncClientCall(client.job, "getJobs", {
              fields,
              filter: {
                users: [], accounts: [], states: [],
                endTime: { startTime: startDate?.toISOString(), endTime: endDate.toISOString() },
              },
            }),
          ).then((result) => processGetJobsResult(cluster, result));

          let currentJobsGroup: ({ cluster: string } & ClusterJobInfo)[] = [];
          let previousDate: string | null = null;
          let savedJobsCount = 0;

          for (const job of jobsInfo) {
            if (job.endTime! === previousDate) {
              currentJobsGroup.push(job);
            } else {
              savedJobsCount += await persistJobAndCharge(currentJobsGroup);
              currentJobsGroup = [job];
            }
            previousDate = job.endTime!;
          }

          // process last group
          if (currentJobsGroup.length > 0) {
            savedJobsCount += await persistJobAndCharge(currentJobsGroup);
          }

          logger.info(`Completed. Saved ${savedJobsCount} new info.`);
          lastFetched = new Date();
          return savedJobsCount;

        } else {
          const midDate = new Date((startDate.getTime() + endDate.getTime()) / 2);
          const firstHalfJobsCount = await fetchWithinTimeRange(startDate, midDate, batchSize);
          const secondHalfJobsCount = await fetchWithinTimeRange(
            new Date(midDate.getTime() + 1000), endDate, batchSize);
          return firstHalfJobsCount + secondHalfJobsCount;
        }

      };

      newJobsCount += await fetchWithinTimeRange(
        startFetchDate ?? new Date(0),
        endFetchDate,
        misConfig.fetchJobs.batchSize,
      );

    }

    return { newJobsCount };
  } catch (e) {
    logger.error("Error when fetching jobs. %o", e);
    throw e;
  }
}
