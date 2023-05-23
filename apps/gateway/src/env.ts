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

import { envConfig, str } from "@scow/lib-config";

export const config = envConfig({
  RESOLVER: str({ desc: "DNS地址", default: "127.0.0.11" }),

  CLIENT_MAX_BODY_SIZE: str({ desc: "请求文件大小限制", default: "1G" }),
  PROXY_READ_TIMEOUT: str({ desc: "应用到server块的proxy_read_timeout", default: "60s" }),

  BASE_PATH: str({ desc: "base path", default: "" }),

  PORTAL_PATH: str({ desc: "门户系统路径", default: "/" }),
  PORTAL_PATH_INTERNAL_URL: str({ desc: "门户系统内部路径", default: "http://portal-web:3000" }),

  MIS_PATH: str({ desc: "管理系统路径", default: "/mis" }),
  MIS_PATH_INTERNAL_URL: str({ desc: "管理系统内部路径", default: "http://mis-web:3000" }),

  VNC_PATH: str({ desc: "VNC客户端路径", default: "/vnc/" }),
  NOVNC_INTERNAL_URL: str({ desc: "NOVNC内部地址", default: "http://novnc:80/" }),

  AUTH_INTERNAL_URL: str({ desc: "认证服务内部地址", default: "http://auth:5000" }),

  EXTRA: str({ desc: "更多nginx配置", default: "" }),

  PUBLIC_DIR: str({ desc: "静态文件路径", default: "/app/apps/gateway/public" }),
  PUBLIC_PATH: str({ desc: "静态文件路径前缀。以/开头，以/结尾", default: "/__public__/" }),
});

