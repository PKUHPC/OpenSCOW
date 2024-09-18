/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { readFileSync } from "fs";

export interface ScowdCertificatesConfig {
  SCOWD_SSL_ENABLED: boolean;
  SCOWD_SSL_CA_CERT_PATH: string;
  SCOWD_SSL_SCOW_CERT_PATH: string;
  SCOWD_SSL_SCOW_PRIVATE_KEY_PATH: string;
}

export interface SslConfig {
  ca?: Buffer;
  key?: Buffer;
  cert?: Buffer;
}

export const createScowdCertificates = (config: ScowdCertificatesConfig) => {
  return config.SCOWD_SSL_ENABLED
    ? {
      ca: readFileSync(config.SCOWD_SSL_CA_CERT_PATH),
      key: readFileSync(config.SCOWD_SSL_SCOW_PRIVATE_KEY_PATH),
      cert: readFileSync(config.SCOWD_SSL_SCOW_CERT_PATH),
    } : {};
};
