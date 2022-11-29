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

import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import fs from "fs";
import { contentType } from "mime-types";
import path from "path";
import { getHostname } from "src/utils/host";
import { route } from "src/utils/route";

export interface GetIconSchema {

  method: "GET";

  query: {
    type: "favicon" | "192" | "512";
  };

  responses: {
    200: any;
  }
}


const CUSTOM_ICONS_DIR = path.join(DEFAULT_CONFIG_BASE_PATH, "icons");

const CUSTOM_DEFAULT_DIR = path.join(CUSTOM_ICONS_DIR, "default");
const BUILTIN_DEFAULT_DIR = "assets/icons";

const DEFAULT_DIR = fs.existsSync(CUSTOM_DEFAULT_DIR) ? CUSTOM_DEFAULT_DIR : BUILTIN_DEFAULT_DIR;

const FILE_NAMES = {
  "favicon": "favicon.ico",
  "192": "192.png",
  "512": "512.png",
};

export default /* #__PURE__*/route<GetIconSchema>("GetIconSchema", async (req, res) => {

  const hostname = getHostname(req);

  let dir = hostname ? path.join(CUSTOM_ICONS_DIR, hostname) : DEFAULT_DIR;

  if (!fs.existsSync(dir)) {
    dir = DEFAULT_DIR;
  }

  let imagePath = path.join(dir, FILE_NAMES[req.query.type]);

  if (!fs.existsSync(imagePath)) {
    imagePath = path.join(dir, FILE_NAMES.favicon);
  }

  const stat = await fs.promises.stat(imagePath);

  res.writeHead(200, {
    "Content-Type": contentType(path.extname(imagePath)) || "application/octet-stream",
    "Content-Length": stat.size,
  });

  const readStream = fs.createReadStream(imagePath);
  await new Promise(function(resolve) {
    readStream.pipe(res);
    readStream.on("end", resolve);
  });

  res.end();

});
