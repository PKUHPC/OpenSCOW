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

export interface LoggingOption {
  driver: string;
  options: {
    [key: string]: string;
  }
}

export interface VolumeSpec {
  name: string;
  options: Record<string, string>;
}

export interface ServiceSpec {
  name: string;
  image: string;
  restart: string;
  ports: Record<string, number>;
  volumes: Record<string, string>;
  environment: Record<string, string>;
  depends_on?: string[];

  logging?: LoggingOption;
}

export function toComposeSpec(
  services: ServiceSpec[], volumes: VolumeSpec[],
  extraServices?: Record<string, object>,
  extraVolumes?: Record<string, object>,
) {

  function extractName(specs: (ServiceSpec | VolumeSpec)[]) {
    return specs.reduce((acc, { name, ...rest }) => {
      acc[name] = rest;
      return acc;
    }, {});
  }

  return {
    version: "3",
    services: {
      ...extractName(services),
      ...extraServices,
    },
    volumes: {
      ...extractName(volumes),
      ...extraVolumes,
    },
  };
}
