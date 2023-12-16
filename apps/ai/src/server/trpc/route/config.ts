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

import { router } from "src/server/trpc/def";
import { procedure } from "src/server/trpc/procedure/base";
import { publicConfig } from "src/utils/config";
import { z } from "zod";


const I18nStringTypeSchema = z.union([
  z.string(),
  z.object({
    i18n: z.object({
      default: z.string(),
      en: z.string().optional(),
      zh_cn: z.string().optional(),
    }),
  }),
]);

const SystemLanguageConfigSchema = z.object({
  defaultLanguage: z.string(),
  isUsingI18n: z.boolean(),
  autoDetectWhenUserNotSet: z.boolean().optional(),
});

const ClusterSchema = z.object({
  id: z.string(),
  name: I18nStringTypeSchema,
});

const NavLinkSchema: z.ZodSchema<any> = z.lazy(() => z.object({
  text: z.string(),
  url: z.string().optional(),
  openInNewPage: z.boolean().optional(),
  iconPath: z.string().optional(),
  children: z.array(
    z.object({
      text: z.string(),
      openInNewPage: z.boolean().optional(),
      iconPath: z.string().optional(),
      url: z.string(),
    }),
  ).optional(),
}));

const UserLinkSchema = z.object({
  text: z.string(),
  url: z.string(),
  openInNewPage: z.boolean().optional(),
});

const PublicConfigSchema = z.object({
  ENABLE_CHANGE_PASSWORD: z.boolean().optional(),
  ENABLE_SHELL: z.boolean(),
  ENABLE_LOGIN_DESKTOP: z.boolean(),
  ENABLE_JOB_MANAGEMENT: z.boolean(),
  ENABLE_APPS: z.boolean(),
  MIS_URL: z.string().optional(),
  CLUSTERS: z.array(ClusterSchema),
  CLUSTER_SORTED_ID_LIST: z.array(z.string()),
  NOVNC_CLIENT_URL: z.string(),
  PASSWORD_PATTERN: z.string().optional(),
  BASE_PATH: z.string(),
  CLIENT_MAX_BODY_SIZE: z.string(),
  FILE_EDIT_SIZE: z.string().optional(),
  FILE_PREVIEW_SIZE: z.string().optional(),
  PUBLIC_PATH: z.string(),
  NAV_LINKS: z.array(NavLinkSchema).optional(),
  USER_LINKS: z.array(UserLinkSchema).optional(),
  VERSION_TAG: z.string().optional(),
  CROSS_CLUSTER_FILE_TRANSFER_ENABLED: z.boolean(),
  RUNTIME_I18N_CONFIG_TEXTS: z.object({
    passwordPatternMessage: I18nStringTypeSchema.optional(),
  }),
  SYSTEM_LANGUAGE_CONFIG: SystemLanguageConfigSchema,
});

// 类型别名
export type PublicConfig = z.infer<typeof PublicConfigSchema>;


export const config = router({

  publicConfig: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/config",
        tags: ["config"],
        summary: "config",
      },
    })
    .input(z.void())
    .output(PublicConfigSchema)
    .query(async ({ ctx: { req, res } }) => {
      return publicConfig;
    }),
});
