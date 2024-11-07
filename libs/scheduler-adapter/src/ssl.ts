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

import { readFileSync } from "fs";

export interface AdapterCertificatesConfig {
  ADAPTER_SSL_ENABLED: boolean;
  ADAPTER_SSL_CA_CERT_PATH: string;
  ADAPTER_SSL_SCOW_CERT_PATH: string;
  ADAPTER_SSL_SCOW_PRIVATE_KEY_PATH: string;
}

export interface SslConfig {
  enabled: boolean;
  ca?: Buffer;
  key?: Buffer;
  cert?: Buffer;
}

export const createAdapterCertificates = (config: AdapterCertificatesConfig) => {
  return config.ADAPTER_SSL_ENABLED
    ? {
      enabled: true,
      ca: readFileSync(config.ADAPTER_SSL_CA_CERT_PATH),
      key: readFileSync(config.ADAPTER_SSL_SCOW_PRIVATE_KEY_PATH),
      cert: readFileSync(config.ADAPTER_SSL_SCOW_CERT_PATH),
    } : { enabled: false };
};
