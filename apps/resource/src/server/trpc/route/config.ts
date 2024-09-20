import { DEFAULT_PRIMARY_COLOR } from "@scow/config/build/ui";
import { uiConfig } from "src/server/config/ui";
import { z } from "zod";

import { router } from "../def";
import { baseProcedure } from "../procedure/base";

const UiConfigSchema = z.object({
  config: z.object({
    footer: z.object({
      defaultText: z.string().optional(),
      hostnameMap: z.record(z.string(), z.string()).optional(),
    }).optional(),
    primaryColor: z.object({
      defaultColor: z.string().default(DEFAULT_PRIMARY_COLOR),
      hostnameMap: z.record(z.string(), z.string()).optional(),
    }).optional(),
  }),
  defaultPrimaryColor: z.string().default(DEFAULT_PRIMARY_COLOR),
});
export type UiConfig = z.infer<typeof UiConfigSchema>;

export const config = router({

  getUiConfig: baseProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/config/ui",
        tags: ["config"],
        summary: "uiConfig",
      },
    })
    .input(z.void())
    .output(UiConfigSchema)
    .query(() => {
      return {
        config: uiConfig,
        defaultPrimaryColor: DEFAULT_PRIMARY_COLOR,
      };
    }),
});
