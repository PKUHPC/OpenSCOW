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

import { Logger } from "ts-log";

export interface CreateDesktopRequest {
  loginNode: string;
  userId: string;
  wm: string;
  desktopName: string;
}

export interface CreateDesktopReply {
  host: string;
  port: number;
  password: string;
}

export interface KillDesktopRequest {
  loginNode: string;
  userId: string;
  displayId: number;
}

export interface KillDesktopReply {}

export interface ConnectToDesktopRequest {
  loginNode: string;
  userId: string;
  displayId: number;
}

export interface ConnectToDesktopReply {
  host: string;
  port: number;
  password: string;
}

export interface ListUserDesktopsRequest {
  userId: string;
  loginNode: string;
}

export interface Desktop {
  displayId: number;
  desktopName: string;
  wm: string;
  createTime?: string;
}

export interface ListUserDesktopsReply {
  host: string;
  desktops: Desktop[]
}

export interface DesktopOps {
  createDesktop(req: CreateDesktopRequest, logger: Logger): Promise<CreateDesktopReply>;
  killDesktop(req: KillDesktopRequest, logger: Logger): Promise<KillDesktopReply>;
  connectToDesktop(req: ConnectToDesktopRequest, logger: Logger): Promise<ConnectToDesktopReply>;
  listUserDesktops(req: ListUserDesktopsRequest, logger: Logger): Promise<ListUserDesktopsReply>;
}
