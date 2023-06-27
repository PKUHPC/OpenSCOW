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

import { NextApiRequest } from "next";
import { setupWssProxy } from "src/pages/api/proxy/[clusterId]/[type]/[node]/[port]/[[...path]]";
import { setupShellServer } from "src/pages/api/shell";

let setup = false;

export default async (req: NextApiRequest, res) => {
  if (setup) {
    res.send("Already setup");
    return;
  }

  setupWssProxy(res);
  setupShellServer(res);

  setup = true;
  res.send("Setup complete");
};
