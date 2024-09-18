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

import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import { serveIcon } from "@scow/lib-web/build/routes/icon/icon";
import { serveLogo } from "@scow/lib-web/build/routes/icon/logo";
import { router } from "src/server/trpc/def";
import { baseProcedure } from "src/server/trpc/procedure/base";
import { z } from "zod";

export const logo = router({

  logo: baseProcedure
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
      return serveLogo(req, res, "assets/logo", DEFAULT_CONFIG_BASE_PATH);
    }),

  icon: baseProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/icon",
        tags: ["logo"],
        summary: "icon",
      },
    })
    .input(z.object({
      type: z.enum(["favicon", "512", "192"]),
    }))
    .output(z.void())
    .query(async ({ ctx: { req, res } }) => {
      return serveIcon(req, res, "assets/icons", DEFAULT_CONFIG_BASE_PATH);
    }),
});
