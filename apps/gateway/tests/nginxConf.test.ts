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
import { getNginxConfig } from "src/parse";

const parser = new ConfigParser();

function parseNginxConfig() {
  const config = getNginxConfig();

  return parser.parse(config);
}

it("parses nginx config", () => {

  const config = parseNginxConfig();

  expect(config.server.listen).toBe("80");
});
