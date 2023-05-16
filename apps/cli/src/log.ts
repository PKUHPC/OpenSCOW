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

import pino from "pino";
import pretty from "pino-pretty";
import { config } from "src/config/env";

const logPretty = pretty({
  include: [
    "level",
    config.LOG_SHOW_TIMESTAMP ? "time" : undefined,
    "msg",
  ].filter((x) => x).join(","),
  sync: true,
});

export const logger = pino({
  level: config.LOG_LEVEL,
}, logPretty);


