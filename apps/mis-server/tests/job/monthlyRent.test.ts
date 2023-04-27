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

/* eslint-disable max-len */
import { Server } from "@ddadaal/tsgrpc-server";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import { Decimal } from "@scow/lib-decimal";
import { createServer } from "src/app";
import { setJobCharge } from "src/bl/charging";
import { clusterNameToScowClusterId } from "src/config/clusters";
import { JobInfo } from "src/entities/JobInfo";
import { OriginalJob } from "src/entities/OriginalJob";
import { UserStatus } from "src/entities/UserAccount";
import { createPriceItems } from "src/tasks/createBillingItems";
import { monthlyRent } from "src/tasks/monthlyRent";
import { reloadEntities } from "src/utils/orm";
import { InitialData, insertInitialData } from "tests/data/data";
import { clearAndClose, dropDatabase } from "tests/data/helpers";

import testData from "./testData.json";

let data: InitialData;
let server: Server;

let initialEm: SqlEntityManager<MySqlDriver>;

beforeEach(async () => {

  server = await createServer();

  initialEm = server.ext.orm.em.fork();

  await createPriceItems(initialEm, server.logger);

  data = await insertInitialData(initialEm);

});

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
});

it("Pay the monthly rent fee", async () => {

  await setJobCharge(data.uaBB, new Decimal(0.01), server.ext, server.logger);
  await initialEm.flush();

  await monthlyRent(server.ext.orm.em.fork(), server.logger);

  const em = server.ext.orm.em.fork();

  const jobs = await em.find(JobInfo, {});

  expect(jobs).toBeArrayOfSize(testData.length);

  // check the cluster is mapped to scow cluster id
  const testDataJobToCluster = testData.reduce((acc, x) => {
    acc[x.biJobIndex] = x.cluster;
    return acc;
  }, {} as Record<string, string>);

  jobs.forEach((x) => {
    expect(x.cluster).toBe(clusterNameToScowClusterId(testDataJobToCluster[x.biJobIndex]));
  });

  jobs.sort((a, b) => a.biJobIndex - b.biJobIndex);

  const wrongPrices = [] as { biJobIndex: number; tenantPrice: { expected: number; actual: number }; accountPrice: { expected: number; actual: number } }[];

  testData.forEach((t) => {
    const job = jobs.find((x) => x.biJobIndex === t.biJobIndex) ?? { biJobIndex: t.biJobIndex, accountPrice: new Decimal(-1), tenantPrice: new Decimal(-1) };
    if (job.tenantPrice.toNumber() !== t.tenantPrice || job.accountPrice.toNumber() !== t.accountPrice) {
      wrongPrices.push({
        biJobIndex: t.biJobIndex,
        tenantPrice: { expected: t.tenantPrice, actual: job.tenantPrice.toNumber() },
        accountPrice: { expected: t.accountPrice, actual: job.accountPrice.toNumber() },
      });
    }
  });


});
