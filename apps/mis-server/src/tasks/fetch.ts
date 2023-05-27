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
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { JobInfo } from "src/entities/JobInfo";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { PricePlugin } from "src/plugins/price";
import testData from "tests/job/testData.json";

async function getLatestDate(em: SqlEntityManager, logger: Logger) {

  const query = em.fork().createQueryBuilder(JobInfo)
    .select("timeEnd")
    .orderBy({ timeEnd: QueryOrder.DESC });

  const { timeEnd = undefined } = (await query.execute("get")) ?? {};

  logger.info(`Latest fetched job's end_time is ${timeEnd}.`);

  return timeEnd;
}

const processGetJobsResult = (result: ({ cluster: string; } & (
  | { success: true; result: GetJobsResponse }
  | { success: false; error: any }
))[]) => {
  const jobs: ({cluster: string} & ClusterJobInfo)[] = [];
  result.forEach((clusterResp) => {
    if (clusterResp.success) {
      jobs.push(...clusterResp.result.jobs.map((job) => ({ cluster: clusterResp.cluster, ...job })));
    }
  });

  // sort by end time
  jobs.sort((a, b) => {
    const endTimeA = new Date(a.endTime!).getTime();
    const endTimeB = new Date(b.endTime!).getTime();
    return endTimeA - endTimeB;
  });

  return jobs;
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

  try {
    const jobsInfo: ({cluster: string} & ClusterJobInfo)[] = [];
    if (!process.env.SCOW_CONFIG_PATH && process.env.NODE_ENV !== "production") {
      // data for test
      jobsInfo.push(...testData.map(({ tenant, accountPrice, tenantPrice, ...rest }) => {
        return {
          ...rest,
          state: "COMPLETED",
          workingDirectory: "",
        };
      }));
    } else {
      const fields: string[] = [
        "job_id", "name", "user", "account", "cpus_alloc", "gpus_alloc", "mem_alloc_mb", "mem_req_mb",
        "partition", "qos", "elapsed_seconds", "node_list", "nodes_req", "nodes_alloc", "time_limit_minutes",
        "submit_time", "start_time", "end_time",
      ];

      const latestDate = await getLatestDate(em, logger);
      const nextDate = latestDate && new Date(latestDate.getTime() + 1000);
      const configDate: Date | undefined =
        (misConfig.fetchJobs.startDate && new Date(misConfig.fetchJobs.startDate)) as Date | undefined;

      const startFetchDate = (nextDate && configDate)
        ? (nextDate > configDate ? nextDate : configDate)
        : (nextDate || configDate);
      const endFetchDate = new Date();
      logger.info(`Fetching new info which end_time is from ${startFetchDate} to ${endFetchDate}`);

      // Fetch new info
      jobsInfo.push(...(await clusterPlugin.clusters.callOnAll(logger, async (client) =>
        await asyncClientCall(client.job, "getJobs", {
          fields,
          filter: {
            users: [], accounts: [], states: [],
            endTime: { startTime: startFetchDate?.toISOString(), endTime: endFetchDate.toISOString() },
          },
        }),
      ).then(processGetJobsResult)));

    }

    const persistJobAndCharge = async (jobs: ({ cluster: string } & ClusterJobInfo)[]) => {
      await em.transactional(async (em) => {
        // Calculate prices for new info and persist
        const pricedJobs = jobs.map((job) => {

          const tenant = accountTenantMap.get(job.account);

          if (!tenant) {
            logger.warn("Account %s doesn't exist. Doesn't charge the job.", job.account);
          }

          const price = tenant ? priceMap.calculatePrice({
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

          const pricedJob = new JobInfo(job, tenant, price);

          em.persist(pricedJob);

          return pricedJob;
        });


        // add job charge for user account
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
              }, em, logger, clusterPlugin);

              // charge tenant
              await charge({
                amount: x.tenantPrice,
                type: misConfig.jobChargeType,
                comment,
                target: ua.account.$.tenant.getEntity(),
              }, em, logger, clusterPlugin);

              await addJobCharge(ua, x.accountPrice, clusterPlugin, logger);
            }
          }));
      });

    };

    let currentJobsGroup: ({ cluster: string } & ClusterJobInfo)[] = [];
    let previousDate: string | null = null;

    for (const job of jobsInfo) {
      if (job.endTime! === previousDate) {
        currentJobsGroup.push(job);
      } else {
        await persistJobAndCharge(currentJobsGroup);
        currentJobsGroup = [job];
      }
      previousDate = job.endTime!;
    }

    // process last group
    if (currentJobsGroup.length > 0) {
      await persistJobAndCharge(currentJobsGroup);
    }

    logger.info(`Completed. Saved ${jobsInfo.length} new info.`);
    lastFetched = new Date();
    return { newJobsCount: jobsInfo.length };
  } catch (e) {
    logger.error("Error when fetching jobs. %o", e);
    throw e;
  }
}
