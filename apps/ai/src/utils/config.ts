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

import { join } from "path";

// Required configs
export const SERVER_URL = process.env.SERVER_URL!;
export const NOVNC_CLIENT_URL = process.env.NOVNC_CLIENT_URL!;

// Default values
export const AGENT_SSL_ENABLED = process.env.AGENT_SSL_ENABLED ? process.env.AGENT_SSL_ENABLED === "true" : true;
export const AGENT_SSL_AGENT_CA_CERT_PATH = process.env.AGENT_SSL_AGENT_CA_CERT_PATH || "../../certs/agent-ca.crt";
export const AGENT_SSL_PLATFORM_CERT_PATH = process.env.AGENT_SSL_PLATFORM_CERT_PATH || "../../certs/xscow.crt";
export const AGENT_SSL_PLATFORM_KEY_PATH = process.env.AGENT_SSL_PLATFORM_KEY_PATH || "../../certs/xscow.key";
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "/";

export const PROXY_BASE_PATH = join(BASE_PATH, "/api/proxy");
