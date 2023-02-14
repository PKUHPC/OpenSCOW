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

import { existsSync } from "fs";
import { NextApiRequest, NextApiResponse } from "next";
import { join } from "path";
import { sendFile, validatePayload } from "src/routes/icon/utils";
import { getHostname } from "src/utils/getHostname";
import { z } from "zod";

const QuerySchema = z.object({
  type: z.enum(["logo", "banner"]),
  preferDark: z.enum(["true", "false"]).default("false"),
});

const exts = ["svg", "png", "jpg"];

export const serveLogo = async (
  req: NextApiRequest, res: NextApiResponse,
  builtinLogoPath: string, configBasePath: string,
) => {

  const query = validatePayload(QuerySchema, req.query, res);

  if (!query) { return; }

  const configLogoPath = join(configBasePath, "logo");

  const { type, preferDark } = query;

  async function trySend(basePath: string) {

    if (preferDark === "true") {
      for (const ext of exts) {
        const darkFilePath = join(basePath, type + ".dark." + ext);
        if (existsSync(darkFilePath)) {
          await sendFile(res, darkFilePath);
          return true;
        }
      }
    }

    for (const ext of exts) {
      const filePath = join(basePath, type + "." + ext);
      if (existsSync(filePath)) {
        await sendFile(res, filePath);
        return true;
      }
    }

    return false;
  }

  // find the domain icons
  const domain = getHostname(req);

  if (domain) {

    const domainPath = join(configLogoPath, domain);

    if (await trySend(domainPath)) {
      return;
    }
  }

  if (await trySend(configLogoPath)) {
    return;
  }

  if (await trySend(builtinLogoPath)) {
    return;
  }

  res.status(404).send("Image file Not Found");
};

