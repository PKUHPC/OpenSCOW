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

import { TRPCError } from "@trpc/server";
import { procedure } from "src/server/trpc/procedure/base";
import { getClusterAppConfigs } from "src/server/utils/app";
import { z } from "zod";

export const appSchema = z.object({ id: z.string(), name: z.string(), logoPath: z.string().optional() });

export type AppSchema = z.infer<typeof appSchema>;

const I18nStringSchema = z.union([
  z.string(),
  z.object({
    i18n: z.object({
      default: z.string(),
      en: z.string().optional(),
      zh_cn: z.string().optional(),
    }),
  }),
]);

const SelectOptionSchema = z.object({
  value: z.string(),
  label: I18nStringSchema.optional(),
  requireGpu: z.boolean().optional(),
});


const AttributeTypeSchema = z.enum(["TEXT", "NUMBER", "SELECT"]);

export type AttributeType = z.infer<typeof AttributeTypeSchema>;

const AppCustomAttributeSchema = z.object({
  type: AttributeTypeSchema,
  label: I18nStringSchema.optional(),
  name: z.string(),
  select: z.array(SelectOptionSchema),
  required: z.boolean(),
  defaultValue: z.union([z.string(), z.number()]).optional(),
  placeholder: I18nStringSchema.optional(),
});

export type AppCustomAttribute = z.infer<typeof AppCustomAttributeSchema>;

export const listAvailableApps = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/jobs/listAvailableApps",
      tags: ["jobs"],
      summary: "List all Available Apps",
    },
  })
  .input(z.object({ clusterId: z.string() }))
  .output(z.object({ apps: z.array(appSchema) }))
  .query(async ({ input }) => {
    const { clusterId } = input;
    const apps = getClusterAppConfigs(clusterId);

    return {
      apps: Object.keys(apps)
        .map((x) => ({ id: x, name: apps[x].name, logoPath: apps[x].logoPath || undefined })),
    };
  });

export const getAppMetadata = procedure
  .meta({
    openapi: {
      method: "GET",
      path: "/jobs/getAppMetadata",
      tags: ["jobs"],
      summary: "Get App Metadata",
    },
  })
  .input(z.object({ clusterId: z.string(), appId: z.string() }))
  .output(z.object({
    appName: z.string(),
    attributes: z.array(AppCustomAttributeSchema),
    appComment: I18nStringSchema.optional(),
  }))
  .query(async ({ input }) => {
    const { clusterId, appId } = input;
    const apps = getClusterAppConfigs(clusterId);
    const app = apps[appId];
    if (!app) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `app id ${appId} is not found`,
      });
    }
    const attributes: AppCustomAttribute[] = [];


    if (app.attributes) {
      app.attributes.forEach((item) => {
        const attributeType = item.type.toUpperCase() as AttributeType;

        attributes.push({
          type: attributeType,
          label: item.label,
          name: item.name,
          required: item.required,
          defaultValue: item.defaultValue,
          placeholder: item.placeholder,
          select: item.select ?? [],
        });
      });
    }

    const comment = app.appComment ?? "";

    return { appName: app.name, attributes: attributes, appComment: comment };
  });

// export const createAppSession = procedure
//   .meta({
//     openapi: {
//       method: "POST",
//       path: "/jobs/createAppSession",
//       tags: ["jobs"],
//       summary: "Create App Session",
//     },
//   })
//   .input(z.object({
//     clusterId: z.string(),
//     appId: z.string(),
//     appJobName: z.string(),
//     algorithm: z.string(),
//     image: z.string(),
//     dataset: z.string().optional(),
//     account: z.string(),
//     partition: z.string().optional(),
//     qos: z.string().optional(),
//     coreCount: z.number(),
//     nodeCount: z.number(),
//     gpuCount: z.number().optional(),
//     memory: z.string().optional(),
//     maxTime: z.number(),
//     customAttributes: z.record(z.string(), z.string()),
//   })).mutation(async ({ input }) => {
//     const { clusterId, appId, appJobName, algorithm,
//       image, dataset, account, partition, qos, coreCount, nodeCount, gpuCount, memory,
//       maxTime, customAttributes } = input;
//     const apps = getClusterAppConfigs(clusterId);
//     const app = apps[appId];

//     if (!app) {
//       throw new TRPCError({
//         code: "NOT_FOUND",
//         message: `app id ${appId} is not found`,
//       });
//     }
//     const attributesConfig = app.attributes;
//     attributesConfig?.forEach((attribute) => {
//       if (attribute.required && !(attribute.name in customAttributes) && attribute.name !== "sbatchOptions") {
//         throw new TRPCError({
//           code: "BAD_REQUEST",
//           message: `custom form attribute ${attribute.name} is required but not found`,
//         });
//       }

//       switch (attribute.type) {
//       case "number":
//         if (customAttributes[attribute.name] && Number.isNaN(Number(customAttributes[attribute.name]))) {
//           throw new TRPCError({
//             code: "BAD_REQUEST",
//             message: `
//               custom form attribute ${attribute.name} should be of type number,
//               but of type ${typeof customAttributes[attribute.name]}`,
//           });
//         }
//         break;

//       case "text":
//         break;

//       case "select":
//         // check the option selected by user is in select attributes as the config defined
//         if (customAttributes[attribute.name]
//           && !(attribute.select!.some((optionItem) => optionItem.value === customAttributes[attribute.name]))) {
//           throw new TRPCError({
//             code: "BAD_REQUEST",
//             message: `
//               the option value of ${attribute.name} selected by user should be
//               one of select attributes as the ${appId} config defined,
//               but is ${customAttributes[attribute.name]}`,
//           });
//         }
//         break;

//       default:
//         throw new TRPCError({
//           code: "BAD_REQUEST",
//           message:`
//           the custom form attributes type in ${appId} config should be one of number, text or select,
//           but the type of ${attribute.name} is ${attribute.type}`,
//         });
//       }
//     });





//     // return { appName: app.name, attributes: attributes, appComment: comment };
//   });
