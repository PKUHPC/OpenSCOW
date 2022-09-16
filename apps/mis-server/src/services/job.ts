import { ensureNotUndefined, plugin } from "@ddadaal/tsgrpc-server";
import { ServiceError, status } from "@grpc/grpc-js";
import { Status } from "@grpc/grpc-js/build/src/constants";
import { FilterQuery, QueryOrder, UniqueConstraintViolationException } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, decimalToMoney, moneyToNumber } from "@scow/lib-decimal";
import { charge, pay } from "src/bl/charging";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { JobInfo as JobInfoEntity } from "src/entities/JobInfo";
import { JobPriceChange } from "src/entities/JobPriceChange";
import { AmountStrategy, JobPriceItem } from "src/entities/JobPriceItem";
import { Tenant } from "src/entities/Tenant";
import {
  GetJobsReply,
  JobBillingItem,
  JobFilter,
  JobInfo, JobServiceServer, JobServiceService,
} from "src/generated/server/job";
import { getActiveBillingItems } from "src/plugins/price";
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

      const type = misConfig.changeJobPriceType;
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

    getRunningJobs: async ({ request, em, logger }) => {
      const { cluster, userId, accountName, tenantName, jobIdList } = request;

      const accountNames = accountName !== undefined
        ? [accountName]
        : tenantName !== undefined
          ? (await em.find(Account, { tenant: { name: tenantName } }, { fields: ["accountName"]}))
            .map((x) => x.accountName)
          : [];

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.job.getRunningJobs({
          request: { userId, accountNames, jobIdList },
          logger,
        }),
      );

      return [{ jobs: reply.jobs }];

    },

    changeJobTimeLimit: async ({ request, logger }) => {
      const { cluster, delta, jobId } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.job.changeJobTimeLimit({
          request: { delta, jobId }, logger,
        }),
      );

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError>{
          code: Status.NOT_FOUND,
        };
      }

      return [{}];
    },

    queryJobTimeLimit: async ({ request, logger }) => {

      const { cluster, jobId } = request;

      const reply = await server.ext.clusters.callOnOne(
        cluster,
        logger,
        async (ops) => ops.job.queryJobTimeLimit({
          request: { jobId },
          logger,
        }),
      );

      if (reply.code === "NOT_FOUND") {
        throw <ServiceError>{
          code: Status.NOT_FOUND,
        };
      }

      return [{ limit: reply.limit }];
    },

    getBillingItems: async ({ request, em }) => {
      const { tenantName, activeOnly } = request;

      let tenant: Tenant | null = null;
      if (tenantName) {
        tenant = await em.findOne(Tenant, { name: tenantName });

        if (!tenant) {
          throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
        }
      }

      const billingItems = await em.find(JobPriceItem, { $or: [{ tenant: null }, { tenant }]},
        {
          populate: ["tenant"],
          orderBy: { createTime: "ASC" },
        });

      const priceItemToGrpc = (item: JobPriceItem) => <JobBillingItem>({
        id: item.itemId,
        path: item.path.join("."),
        tenantName: item.tenant?.getProperty("name"),
        price: decimalToMoney(item.price),
        createTime: item.createTime,
        amountStrategy: item.amount,
      });

      if (activeOnly) {
        const { defaultPrices, tenantSpecificPrices } = getActiveBillingItems(billingItems);

        const activePrices = tenantName
          ? Object.values({ ...defaultPrices, ...tenantSpecificPrices[tenantName] })
          : [
            ...Object.values(defaultPrices),
            ...Object.values(tenantSpecificPrices).map((x) => Object.values(x)).flat(),
          ];

        return [{ items: activePrices.map(priceItemToGrpc) }];
      } else {
        return [{ items: billingItems.map(priceItemToGrpc) }];
      }

    },

    addBillingItem: async ({ request, em }) => {
      const { tenantName, itemId, price, amountStrategy, path, description } = ensureNotUndefined(request, ["price"]);

      let tenant: Tenant | undefined = undefined;
      if (tenantName) {
        tenant = await em.findOne(Tenant, { name: tenantName }) ?? undefined;

        if (!tenant) {
          throw <ServiceError>{ code: status.NOT_FOUND, message: `Tenant ${tenantName} is not found.` };
        }
      }

      if (!(Object.values(AmountStrategy) as string[]).includes(amountStrategy)) {
        throw <ServiceError>{
          code: status.INVALID_ARGUMENT,
          message: `Amount strategy ${amountStrategy} is not valid.` };
      }

      const item = new JobPriceItem({
        amount: amountStrategy as AmountStrategy,
        itemId,
        price: new Decimal(moneyToNumber(price)),
        description: description ?? "",
        tenant,
        path: path.split("."),
      });

      try {
        await em.persistAndFlush(item);
        return [{}];
      } catch (e) {
        if (e instanceof UniqueConstraintViolationException) {
          throw <ServiceError>{ code: status.ALREADY_EXISTS, message: `${itemId} already exists.` };
        } else {
          throw e;
        }
      }

    },
  });
});
