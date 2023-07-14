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

import { bool, envConfig, host, port, str } from "@scow/lib-config";

export const config = envConfig({
  HOST: host({ default: "0.0.0.0", desc: "监听地址" }),
  PORT: port({ default: 6000, desc: "监听端口" }),
  LOG_LEVEL: str({
    default: "info",
    desc: "日志等级",
  }),
  LOG_PRETTY: bool({ desc: "以可读的方式输出log", default: false }),

});
