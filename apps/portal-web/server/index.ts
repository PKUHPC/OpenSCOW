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

import { createServer } from "http";
import next from "next";
import { join } from "path";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = +(process.env.PORT ?? 3000);
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

async function main() {

  await app.prepare();

  const server = createServer(async (req, res) => {

    (req.socket as any).server = server;
    await handle(req, res);
  });

  server.listen(port, hostname, () => {
    console.log("Listening on %s:%s", hostname, port);

    const basePath = process.env.BASE_PATH ?? "/";

    // HACK
    const url = `http://${hostname}:${port}${join(basePath, "/api/setup")}`;
    console.log("Calling setup url to initialize proxy and shell server", url);

    fetch(url).then(async (res) => {
      console.log("Call completed. Response: ", await res.text());
    }).catch((e) => {
      console.error("Error when calling proxy url to initialize ws proxy server", e);
    });
  });
}

main();
