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

import { I18nStringType } from "./i18n";

export interface Cluster { id: string; name: I18nStringType; };

export enum ClusterActivationStatus {
  ACTIVATED = 0,
  DEACTIVATED = 1,
}

export const ClusterRuntimeInfoSchema = Type.Object({
  clusterId: Type.String(),
  activationStatus: Type.Enum(ClusterActivationStatus),
  operatorId: Type.Optional(Type.String()),
  operatorName: Type.Optional(Type.String()),
  deactivationComment: Type.Optional(Type.String()),
  updateTime: Type.Optional(Type.String()),
  hpcEnabled: Type.Optional(Type.Boolean()),
});

export type ClusterRuntimeInfo = Static<typeof ClusterRuntimeInfoSchema>;
