import { plugin } from "@ddadaal/tsgrpc-server";
import { ensureNotUndefined } from "@ddadaal/tsgrpc-utils";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { FilterQuery, QueryOrder } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { charge, pay } from "src/bl/charging";
import { config } from "src/config";
import { Account } from "src/entities/Account";
import { JobInfo as JobInfoEntity } from "src/entities/JobInfo";
import { JobPriceChange } from "src/entities/JobPriceChange";
import { Tenant } from "src/entities/Tenant";
import { JobServiceClient } from "src/generated/clusterops/job";
import {
  GetJobsReply,
  JobFilter,
  JobInfo, JobServiceServer, JobServiceService,
} from "src/generated/server/job";
import { paginationProps } from "src/utils/orm";

function toGrpc(x: JobInfoEntity) {
  return <JobInfo>{
    account: x.account,
    biJobIndex: x.biJobIndex,
    cluster: x.cluster,
    cpusAlloc: x.cpusAlloc,
    cpusReq: x.cpusReq,
    gpu: x.gpu,
    idJob: x.idJob,
    jobName: x.jobName,
    memAlloc: x.memAlloc,
    memReq: x.memReq,
    nodelist: x.nodelist,
    nodesAlloc: x.nodesAlloc,
    nodesReq: x.nodesReq,
    partition: x.partition,
    qos: x.qos,
    recordTime: x.recordTime,
    timeEnd: x.timeEnd,
    timeStart: x.timeStart,
    timeSubmit: x.timeSubmit,
    timeUsed: x.timeUsed,
    timeWait: x.timeWait,
    timelimit: x.timelimit,
    user: x.user,
    tenantPrice: decimalToMoney(x.tenantPrice),
    accountPrice: decimalToMoney(x.accountPrice),
  };
}

async function filterJobs({
  clusters, accountName, jobEndTimeEnd, tenantName,
  jobEndTimeStart, jobId, userId,
}: JobFilter, em: SqlEntityManager<MySqlDriver>) {

  const accountNames = (accountName === undefined && userId === undefined)
    ? (await em.find(Account, { tenant: { name: tenantName } }, { fields: ["accountName"]})).map((x) => x.accountName)
    : accountName;

  return {
    ...userId ? { user: userId } : {},
    ...clusters.length > 0 ? { cluster: clusters } : {},
    ...jobId
      ? {
        idJob: jobId,
      } : {
        ...accountNames === undefined ? {} : { account: accountNames },
        ...(jobEndTimeEnd || jobEndTimeStart) ? {
          timeEnd: {
            ...jobEndTimeStart ? { $gte: jobEndTimeStart } : {},
            ...jobEndTimeEnd ? { $lte: jobEndTimeEnd } : {},
          },
        } : {},
      },
  } as FilterQuery<JobInfoEntity>;
}

export const jobServiceServer = plugin((server) => {

  server.addService<JobServiceServer>(JobServiceService, {

    getJobs: async ({ request, em }) => {

      const { filter, page, pageSize } = ensureNotUndefined(request, ["filter"]);

      const sqlFilter = await filterJobs(filter, em);

      const [jobs, count] = await em.findAndCount(JobInfoEntity, sqlFilter, {
        ...paginationProps(page, pageSize || 10),
        orderBy: { timeEnd: QueryOrder.DESC },
      });

      const { total_account_price, total_tenant_price }: { total_account_price: string, total_tenant_price: string } =
       await em.createQueryBuilder(JobInfoEntity, "j")
         .where(sqlFilter)
         .select("sum(j.account_price) as total_account_price, sum(j.tenant_price) as total_tenant_price")
         .execute("get");

      const reply = {
        totalCount: count,
        jobs: jobs.map(toGrpc),
        totalAccountPrice: decimalToMoney(new Decimal(total_account_price)),
        totalTenantPrice: decimalToMoney(new Decimal(total_tenant_price)),
      } as GetJobsReply;

      return [reply];
    },

    changeJobPrice: async ({ request, em, logger }) => {
      const { filter, accountPrice, tenantPrice, reason, operatorId, ipAddress } =
        ensureNotUndefined(request, ["filter"]);

      const type = config.JOB_PRICE_CHANGE_CHARGING_TYPE;
      const newAccountPrice = accountPrice ? new Decimal(moneyToNumber(accountPrice)) : undefined;
      const newTenantPrice = tenantPrice ? new Decimal(moneyToNumber(tenantPrice)) : undefined;

      return await em.transactional(async (em) => {

        const jobs = await em.find(JobInfoEntity, await filterJobs(filter, em), {});

        const record = new JobPriceChange({
          jobs,
          newAccountPrice,
          newTenantPrice,
          time: new Date(),
          operatorId,
          reason,
          ipAddress,
        });

        await em.persistAndFlush(record);

        const accountNames = Array.from(new Set(jobs.map((x) => x.account)));
        const accounts = await em.find(Account, { accountName: accountNames }, {
          populate: ["tenant"],
        });

        const accountMap: Record<string, typeof accounts[0]> = accounts.reduce((prev, curr) => {
          prev[curr.accountName] = curr;
          return prev;
        }, {});


        await Promise.all(jobs.map(async (x) => {
          logger.info("Change the prices of job %s from %s(tenant), $s(account) -> %s(tenant), %s(account)",
            x.biJobIndex, x.tenantPrice.toFixed(2), x.accountPrice.toFixed(2),
            newTenantPrice?.toFixed(2) ?? "not changed", newAccountPrice?.toFixed(2) ?? "not changed",
          );

          // change the price of the account
          const account = accountMap[x.account];

          if (!account) {
            throw <ServiceError> {
              code: status.INTERNAL,
              message: `Unknown account ${x.account} of job ${x.biJobIndex}`,
            };
          }

          const comment = `Record id ${record.id}, job biJobIndex ${x.biJobIndex}`;

          if (newTenantPrice) {
            if (x.tenantPrice.lt(newTenantPrice)) {
              await charge({
                target: account.tenant.$,
                comment,
                type,
                amount: newTenantPrice.minus(x.tenantPrice),
              }, em, logger, server.ext);
            } else if (x.tenantPrice.gt(newTenantPrice)) {
              await pay({
                target: account.tenant.$,
                comment,
                amount: x.tenantPrice.minus(newTenantPrice),
                operatorId,
                type,
                ipAddress,
              }, em, logger, server.ext);
            }
            x.tenantPrice = newTenantPrice;
          }

          if (newAccountPrice) {
            if (x.accountPrice.lt(newAccountPrice)) {
              await charge({
                target: account,
                comment,
                type,
                amount: newAccountPrice.minus(x.accountPrice),
              }, em, logger, server.ext);
            } else if (x.accountPrice.gt(newAccountPrice)) {
              await pay({
                target: account,
                comment,
                amount: x.accountPrice.minus(newAccountPrice),
                operatorId,
                type,
                ipAddress,
              }, em, logger, server.ext);
            }
            x.accountPrice = newAccountPrice;
          }
        }));


        return [{ count: jobs.length }];
      });
    },

    getJobByBiJobIndex: async ({ request, em }) => {
      const { biJobIndex } = request;

      const job = await em.findOne(JobInfoEntity, { biJobIndex: +biJobIndex });

      if (!job) {
        throw <ServiceError>{
          code: Status.NOT_FOUND,
        };
      }

      return [{ info: toGrpc(job) }];
    },

    getRunningJobs: async ({ request, em }) => {
      const { cluster, userId, accountName, tenantName, jobIdList } = request;

      const accountNames = accountName !== undefined
        ? [accountName]
        : tenantName !== undefined
          ? (await em.find(Account, { tenant: { name: tenantName } }, { fields: ["accountName"]}))
            .map((x) => x.accountName)
          : [];

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        JobServiceClient,
        "getRunningJobs",
        { userId, accountNames, jobIdList },
      );

      return [{ jobs: reply.jobs }];

    },

    changeJobTimeLimit: async ({ request }) => {
      const { cluster, delta, jobId } = request;

      await server.ext.clusters.callOnOne(
        cluster,
        JobServiceClient,
        "changeJobTimeLimit",
        { delta, jobId },
      );

      return [{}];
    },

    queryJobTimeLimit: async ({ request }) => {

      const { cluster, jobId } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        JobServiceClient,
        "queryJobTimeLimit",
        { jobId },
      );

      return [{ limit: reply.limit }];
    },

    getBillingItems: async ({ request, em }) => {
      const { tenantName } = request;

      const tenant = await em.findOne(Tenant, { name: tenantName });

      if (!tenant) {
        throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
      }

      const priceMap = await server.ext.price.createPriceMap();

      return [{ items: Object.entries(priceMap.getPriceMap(tenantName)).reduce((prev, [id, item]) => {
        prev[id] = decimalToMoney(item.price);
        return prev;
      }, {}) }];
    },


  });
});
