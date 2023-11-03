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

import { Server } from "@ddadaal/tsgrpc-server";
import fs from "fs";
import path, { dirname } from "path";

let server: Server;

jest.mock("@scow/config/build/mis", () => {
  return {
    getMisConfig:
      jest.fn().mockReturnValue({
        db: {
          host: "localhost",
          port: 3306,
          user: "root",
          password: "mysqlrootpassword",
          dbName: "scow_server_${JEST_WORKER_ID}",
          debug: false,
        },
        authUrl: "http://auth:5000",
        predefinedChargingTypes: [],
        createUser: { enabled: true, type: "builtin", builtin: {} },
        fetchJobs: {
          batchSize: 10000,
          periodicFetch: { enabled: true, cron: "* * 1 * * *" },
        },
        jobChargeType: "作业费用",
        changeJobPriceType: "作业费用更改",
        jobChargeComment: "集群: {{ cluster }}，作业ID：{{ idJob }}",
        customAmountStrategies: [
          {
            id: "strategy1",
            name: "自定义收费计算方式1",
            comment: "自定义收费计算方式1，运行时间低于3分钟以下的作业不计费，大于或等于3分钟的按照gpu或cpu用量计算",
            script: "my-strategy.js",
          },
        ],
      }),
  };
});

const pathArr = __dirname.split("/");
pathArr.splice(-2, 2, "config");
const configFolderPath = pathArr.join("/");

jest.mock("@scow/config/build/constants", () => {
  return { DEFAULT_CONFIG_BASE_PATH: configFolderPath };
});

const folderPath = path.join("config", "scripts");
const fullConfigFilePath = path.join(folderPath, "my-strategy.js");
fs.mkdirSync(dirname(fullConfigFilePath), { recursive: true });
fs.writeFileSync(fullConfigFilePath, "function myStrategy(jobInfo){"
  + "if (jobInfo.timeUsed < 180)"
  + "{return 0;}"
  + "return info.cpusAlloc;}"
  + "module.exports = myStrategy;");

import { createServer } from "src/app";
import { dropDatabase } from "tests/data/helpers";

afterEach(async () => {
  await dropDatabase(server.ext.orm);
  await server.close();
  await fs.promises.rm(folderPath, { recursive: true });
});


it("success to create server when added a customAmountStrategy", async () => {
  server = await createServer();
  await server.start();
});
