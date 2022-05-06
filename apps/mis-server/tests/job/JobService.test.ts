import { Server } from "@ddadaal/tsgrpc-server";
import { asyncClientCall } from "@ddadaal/tsgrpc-utils";
import { ChannelCredentials } from "@grpc/grpc-js";
import { SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal, moneyToNumber, numberToMoney } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { JobInfo } from "src/entities/JobInfo";
import { JobPriceChange } from "src/entities/JobPriceChange";
import { UserAccount } from "src/entities/UserAccount";
import { JobServiceClient } from "src/generated/server/job";
import { ormConfigs } from "src/plugins/orm";
import { range } from "src/utils/array";
import { UNKNOWN_PRICE_ITEM } from "src/utils/constants";
import { reloadEntities } from "src/utils/orm";
import { InitialData, insertInitialData } from "tests/data/data";

let server: Server;
let em: SqlEntityManager;
let data: InitialData;

beforeEach(async () => {

  server = await createServer();

  em = server.ext.orm.em.fork();

  data = await insertInitialData(em);

  await server.start();
});

afterEach(async () => {
  await server.ext.orm.getSchemaGenerator().dropDatabase(ormConfigs.dbName!);
  await server.close();
});

const mockOriginalJobData = (
  biJobIndex: number, ua: UserAccount,
  tenantPrice: Decimal, accountPrice: Decimal,
) => new JobInfo({
  biJobIndex,
  "idJob": 5119061,
  "account": ua.account.getProperty("accountName"),
  user: ua.user.getProperty("userId"),
  "partition": "C032M0128G",
  "nodelist": "a5u15n01",
  "jobName": "CoW",
  "cluster": "hpc00",
  "timeSubmit": new Date("2020-04-23T22:23:00.000Z"),
  "timeStart": new Date("2020-04-23T22:25:12.000Z"),
  "timeEnd": new Date("2020-04-23T23:18:02.000Z"),
  "gpu": 0,
  "cpusReq": 32,
  "memReq": 124000,
  "nodesReq": 1,
  "cpusAlloc": 32,
  "memAlloc": 124000,
  "nodesAlloc": 1,
  "timelimit": 7200,
  "timeUsed": 3170,
  "timeWait": 132,
  "qos": "normal",
  "recordTime": new Date("2020-04-23T23:49:50.000Z"),
}, data.tenant.name, tenantPrice, UNKNOWN_PRICE_ITEM, accountPrice, UNKNOWN_PRICE_ITEM);

function createClient() {
  return new JobServiceClient(server.serverAddress, ChannelCredentials.createInsecure());
}

it("changes job prices", async () => {
  // insert jobs
  const jobs = [
    mockOriginalJobData(1, data.uaAB, new Decimal(1), new Decimal(2)),
    mockOriginalJobData(2, data.uaBB, new Decimal(2), new Decimal(4)),
    mockOriginalJobData(3, data.uaAA, new Decimal(4), new Decimal(8)),
  ];

  data.accountA.balance = new Decimal(100);

  await em.persistAndFlush(jobs);

  const prevTenantBalance = data.tenant.balance;
  const prevABalance = data.accountA.balance;
  const prevBBalance = data.accountB.balance;

  // change the prices job 1,2 to 1.6

  const client = createClient();

  await asyncClientCall(client, "changeJobPrice", {
    filter: { tenantName: data.tenant.name, userId: data.userB.userId, clusters: []},
    ipAddress: "",
    operatorId: "123",
    reason: "test",
    accountPrice: numberToMoney(1.6),
    tenantPrice: numberToMoney(1.7),
  });

  // check prices

  const jobInfo = [0, 1].map((x) => ({
    biJobIndex: jobs[x].biJobIndex,
    accountPrice: jobs[x].accountPrice.toFixed(4),
    tenantPrice: jobs[x].tenantPrice.toFixed(4),
  }));

  await reloadEntities(jobs);

  expect(jobs.map((x) => x.tenantPrice.toNumber())).toStrictEqual([1.7, 1.7, 4]);
  expect(jobs.map((x) => x.accountPrice.toNumber())).toStrictEqual([1.6, 1.6, 8]);

  const records = await em.find(JobPriceChange, { });

  expect(records).toHaveLength(1);
  const record = records[0];
  expect(record.jobs).toIncludeSameMembers(jobInfo);
  expect(record.newAccountPrice?.toNumber()).toBe(1.6);
  expect(record.newTenantPrice?.toNumber()).toBe(1.7);

  await reloadEntities([data.tenant, data.accountA, data.accountB]);

  // check balances
  expect(data.tenant.balance.toNumber()).toBe(prevTenantBalance.minus(0.4).toNumber()); // 1-1.7+2-1.7
  expect(data.accountA.balance.toNumber()).toBe(prevABalance.plus(2-1.6).toNumber());
  expect(data.accountB.balance.toNumber()).toBe(prevBBalance.plus(4-1.6).toNumber());
});

it("returns 10 jobs if pageSize is undefined or 0", async () => {

  const em = server.ext.orm.em.fork();

  await em.persistAndFlush(range(1, 20).map((x) =>
    mockOriginalJobData(x, data.uaAA, new Decimal(20), new Decimal(10))));

  const test = async (pageSize?: number) => {
    const client = createClient();

    const reply = await asyncClientCall(client, "getJobs", {
      filter: { tenantName: data.tenant.name, clusters: []},
      page: 1,
      pageSize,
    });

    expect(reply.jobs).toHaveLength(10);
    expect(moneyToNumber(reply.totalAccountPrice!)).toBe(190);
    expect(moneyToNumber(reply.totalTenantPrice!)).toBe(380);
  };

  await Promise.all([test(0), test()]);

});
