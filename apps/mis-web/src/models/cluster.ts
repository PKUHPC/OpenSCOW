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

import { Static, Type } from "@sinclair/typebox";
import { ValueOf } from "next/dist/shared/lib/constants";

export const Partition = Type.Object({
  name: Type.String(),
  memMb: Type.Number(),
  cores: Type.Number(),
  gpus: Type.Number(),
  nodes: Type.Number(),
  qos: Type.Optional(Type.Array(Type.String())),
  comment: Type.Optional(Type.String()),
});
export type Partition = Static<typeof Partition>;

export const ClusterConnectionStatus = {
  AVAILABLE: 0,
  ERROR: 1,
} as const;

export type ClusterConnectionStatus = ValueOf<typeof ClusterConnectionStatus>;

export const ClusterConnectionInfoSchema = Type.Object({
  clusterId: Type.String(),
  connectionStatus: Type.Enum(ClusterConnectionStatus),
  schedulerName: Type.Optional(Type.String()),
  partitions: Type.Array(Partition),
});

export type ClusterConnectionInfo = Static<typeof ClusterConnectionInfoSchema>;
