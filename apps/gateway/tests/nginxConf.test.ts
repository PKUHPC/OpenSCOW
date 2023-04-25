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

import ConfigParser from "@webantic/nginx-config-parser";
import { config } from "src/env";
import { getNginxConfig } from "src/parse";

const parser = new ConfigParser();

function parseNginxConfig(envConfig: typeof config) {
  const nginxConf = getNginxConfig(envConfig);
  return parser.parse(nginxConf);
}

it("parses nginx config", () => {

  const nginxConf = parseNginxConfig(config);

  expect(nginxConf.server.listen).toBe("80");
});

it("configures proxy_read_timeout", async () => {

  const nginxConf = parseNginxConfig(config);

  expect(nginxConf.server.proxy_read_timeout).toBe(config.PROXY_READ_TIMEOUT);

});
