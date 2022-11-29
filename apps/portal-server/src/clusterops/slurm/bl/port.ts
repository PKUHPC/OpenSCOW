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

import net from "net";

export async function getFreePort(): Promise<number> {
  return new Promise((res) => {
    const server = net.createServer((s) => {
      s.end("Hello world\n");
    });
    server.listen(0, () => {
      const port = (server.address() as net.AddressInfo).port;
      res(port);
    }).close();
  });

}

const DISPLAY_ID_PORT_DELTA = 5900;

export function displayIdToPort(displayId: number): number {
  return DISPLAY_ID_PORT_DELTA + displayId;
}

export function portToDisplayId(port: number): number {
  return port - DISPLAY_ID_PORT_DELTA;
}
