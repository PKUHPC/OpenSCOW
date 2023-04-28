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

import { statSync } from "fs";
import { join } from "path";
import { createComposeSpec } from "src/compose";
import { getInstallConfig } from "src/config/install";
import { configPath, createInstallYaml, testBaseFolder } from "tests/utils";

it("creates log dir for fluentd", async () => {

  const config = getInstallConfig(configPath);

  const logDir = join(testBaseFolder, "logdir");

  config.log.fluentd = { logDir, image: "fluentd:v1.14.0-1.0" };

  createComposeSpec(config);

  const s = statSync(logDir);

  expect(s.mode).toBe(0o40777);
});

it("generate correct paths", async () => {

  const config = getInstallConfig(configPath);

  config.portal = { basePath: "/", novncClientImage: "" };
  config.mis = { basePath: "/mis", dbPassword: "must!chang3this", mysqlImage: "" };

  const composeConfig = createComposeSpec(config);

  expect(composeConfig.services["portal-web"].environment).toContain("MIS_URL=/mis");
  expect(composeConfig.services["mis-web"].environment).toContain("PORTAL_URL=/");
});

it("sets proxy_read_timeout", async () => {
  const config = getInstallConfig(configPath);
  config.gateway.proxyReadTimeout = "100";

  const composeSpec = createComposeSpec(config);

  expect(composeSpec.services["gateway"].environment)
    .toInclude(`PROXY_READ_TIMEOUT=${config.gateway.proxyReadTimeout}`);
});

describe("sets custom auth environment", () => {

  it("accepts object", async () => {

    const configPath = await createInstallYaml({
      auth: {
        custom: {
          image: "",
          environment: {
            "CUSTOM_AUTH_KEY": "CUSTOM_AUTH_VALUE",
          },
        },
      },
    });

    const spec = createComposeSpec(getInstallConfig(configPath));

    expect(spec.services["auth"].environment)
      .toInclude("CUSTOM_AUTH_KEY=CUSTOM_AUTH_VALUE");
  });

  it("accepts array", async () => {
    const configPath = await createInstallYaml({
      auth: {
        custom: {
          image: "",
          environment: [
            "CUSTOM_AUTH_KEY=CUSTOM_AUTH_VALUE",
          ],
        },
      },
    });

    const spec = createComposeSpec(getInstallConfig(configPath));

    expect(spec.services["auth"].environment)
      .toInclude("CUSTOM_AUTH_KEY=CUSTOM_AUTH_VALUE");
  });
});
