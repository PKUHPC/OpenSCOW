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

import { joinWithUrl } from "@scow/utils";
import { join } from "path";
import { publicConfig } from "src/utils/config";

export const openDesktop = (node: string, port: number, password: string) => {

  const params = new URLSearchParams({
    path: join(publicConfig.WSPROXY_BASE_PATH, node, String(port)),
    host: location.hostname,
    port: location.port,
    password: password,
    autoconnect: "true",
    reconnect: "true",
    resize: "remote",
  });


  const vncUrl = joinWithUrl(publicConfig.NOVNC_CLIENT_URL, "/vnc.html");
  console.log(publicConfig.NOVNC_CLIENT_URL, vncUrl);
  window.open(vncUrl + "?" + params.toString(), "_blank");
};

