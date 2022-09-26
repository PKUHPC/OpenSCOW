import { Logger } from "@ddadaal/tsgrpc-server";
import { MikroORM, QueryOrder } from "@mikro-orm/core";
import { MariaDbDriver } from "@mikro-orm/mariadb";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { parsePlaceholder } from "@scow/config";
import { charge } from "src/bl/charging";
import { misConfig } from "src/config/mis";
import { Account } from "src/entities/Account";
import { JobInfo } from "src/entities/JobInfo";
import { OriginalJob } from "src/entities/OriginalJob";
import { UserAccount } from "src/entities/UserAccount";
import { ClusterPlugin } from "src/plugins/clusters";
import { emptyJobPriceInfo, PricePlugin } from "src/plugins/price";

export const createSourceDbOrm = async (logger: Logger) => {
  logger.info("Connecting to source db.");

  const dbConnection = await MikroORM.init<MariaDbDriver>({
    host: misConfig.fetchJobs.db.host,
    port: misConfig.fetchJobs.db.port,
    user: misConfig.fetchJobs.db.user,
    dbName: misConfig.fetchJobs.db.dbName,
    password: misConfig.fetchJobs.db.password,
    type: "mariadb",
    forceUndefined: true,
    logger: (msg) => logger.info(msg),
    entities: [OriginalJob],
  });

  logger.info("Source db is connected.");

  return {
    dbConnection,
    getEm: () => dbConnection.em.fork(),
    close: async () => {
      logger.info("Closing source db connection.");
      await dbConnection.close();
      logger.info("Source db connection has been closed.");
    },
  };
};

async function getLatestIndex(em: SqlEntityManager, logger: Logger) {

  const query = em.fork().createQueryBuilder(JobInfo)
    .select("biJobIndex")
    .orderBy({ biJobIndex: QueryOrder.DESC });

  const { biJobIndex = 0 } = (await query.execute("get")) ?? {};

  logger.info(`Latest biJobIndex from billing db is ${biJobIndex}.`);

  return biJobIndex;
}

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

  const sourceOrm = await createSourceDbOrm(logger);

  try {

    const latestIndex = await getLatestIndex(em, logger);

    const startIndex = Math.max(latestIndex + 1, misConfig.fetchJobs.startIndex);
    logger.info(`Fetching new info from ${startIndex}`);

    // Fetch new info

    // count data
    const sourceEm = sourceOrm.getEm();

    const count = await sourceEm.count(OriginalJob, { biJobIndex: { $gte: startIndex } });
    logger.info(`${count} new records to fetch.`);

    const batchSize = misConfig.fetchJobs.batchSize;
    const loopCount = Math.ceil(count / batchSize);

    logger.info(`Batch size is ${batchSize}. ${loopCount} rounds to complete.`);

    for (let i = 0; i < loopCount; i++) {
      logger.info(`Fetching next batch from ${i * batchSize}. Round ${i + 1}/${loopCount}`);

      const info = await sourceEm.find(OriginalJob, {
        biJobIndex: { $gte: startIndex + i * batchSize },
      }, {
        limit: batchSize,
        orderBy: { biJobIndex: QueryOrder.ASC },
      });

      await em.transactional(async (em) => {

        sourceEm.clear();

        // Calculate prices for new info and persist
        const pricedJobs = info.map((i) => {

          const tenant = accountTenantMap.get(i.account);

          if (!tenant) {
            logger.warn("Account %s doesn't exist. Doesn't charge the job.", i.account);
          }

          const price = tenant ? priceMap.calculatePrice({
            biJobIndex: i.biJobIndex,
            cluster: i.cluster,
            cpusAlloc: i.cpusAlloc,
            gpu: i.gpu,
            memAlloc: i.memAlloc,
            memReq: i.memReq,
            partition: i.partition,
            qos: i.qos,
            timeUsed: i.timeUsed,
            account: i.account,
            tenant,
          }) : emptyJobPriceInfo();

          // 从job_table读出来的数据实际上是+8时区，但是读出来的时间字符串中不包含时区信息
          // 由于容器本身是+0时区，所以程序将会以为读出来的是+0时区的时间
          // 造成直接存储进数据库的时间比实际时间要多8个小时
          // 这里需要转换一下，减掉8小时
          function convertToUTC(date: Date) {
            return new Date(date.getTime() - 8 * 60 * 60 * 1000);
          }

          (["timeEnd", "timeStart", "timeSubmit", "recordTime"] as const)
            .forEach((k) => {
              i[k] = convertToUTC(i[k]);
            });

          const pricedJob = new JobInfo(i, tenant, price);

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

              await ua.addJobCharge(x.tenantPrice, clusterPlugin, logger);
            }
          }));

        logger.info(`Round ${i + 1}/${loopCount} completed and persisted. Wait 2 seconds for next round.`);
      });

      await new Promise((res) => setTimeout(res, 2000));
    }

    logger.info(`Completed. Saved ${count} new info.`);
    lastFetched = new Date();
    return { newJobsCount: count };
  } catch (e) {
    logger.error("Error when fetching jobs. %o", e);
    throw e;
  } finally {
    await sourceOrm.close();


  }
}
