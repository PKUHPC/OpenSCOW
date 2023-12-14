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
import { serveLogo } from "@scow/lib-web/build/routes/icon/logo";
import { router } from "src/server/trpc/def";
import { procedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

const BUILTIN_DEFAULT_DIR = "assets/logo";

export const logo = router({

  logo: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/logo",
        tags: ["logo"],
        summary: "logo",
      },
    })
    .input(z.object({
      type: z.enum(["logo", "banner"]),
      preferDark: z.enum(["true", "false"]).default("false"),
    }))
    .output(z.void())
    .query(async ({ ctx: { req, res } }) => {
      return serveLogo(req, res, BUILTIN_DEFAULT_DIR, DEFAULT_CONFIG_BASE_PATH);
    }),
});
