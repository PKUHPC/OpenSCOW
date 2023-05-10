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

import { bool, envConfig, str } from "@scow/lib-config";

export const config = envConfig({
  LOG_LEVEL: str({ desc: "日志等级", default: "info" }),
  LOG_SHOW_TIMESTAMP: bool({ desc: "日志显示时间戳", default: false }),

  HTTPS_PROXY: str({ desc: "https代理，优先级1", default: undefined }),
  https_proxy: str({ desc: "https代理，优先级2", default: undefined }),
  HTTP_PROXY: str({ desc: "https代理，优先级3", default: undefined }),
  http_proxy: str({ desc: "https代理，优先级4", default: undefined }),
});
