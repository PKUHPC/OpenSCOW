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

import { MikroORM } from "@mikro-orm/mysql";
import { AppConfigSchema } from "@scow/config/build/appForAi";
import { DEFAULT_CONFIG_BASE_PATH } from "@scow/config/build/constants";
import { TRPCError } from "@trpc/server";
import { join } from "path";
import { getAiAppConfigs } from "src/server/config/apps";
import { AlgorithmVersion } from "src/server/entities/AlgorithmVersion";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { Image } from "src/server/entities/Image";
import { ModalVersion } from "src/server/entities/ModalVersion";


export const getClusterAppConfigs = (cluster: string) => {

  const commonApps = getAiAppConfigs();

  const clusterAppsConfigs = getAiAppConfigs(join(DEFAULT_CONFIG_BASE_PATH, "clusters/", cluster));

  const apps: Record<string, AppConfigSchema> = {};

  for (const [key, value] of Object.entries(commonApps)) {
    apps[key] = value;
  }

  for (const [key, value] of Object.entries(clusterAppsConfigs)) {
    apps[key] = value;
  }

  return apps;

};

/**
 * @param orm mikro-orm
 * @param dataset dataset version id
 * @param algorithm algorithm version id
 * @param image image id
 * @param model model version id
 * @returns datasetVersion, algorithmVersion, modelVersion, image
 * @throws TRPCError if dataset, algorithm, image, model is not found
 */
export const checkCreateAppEntity = async ({ orm, dataset, algorithm, image, model }: {
  orm: MikroORM
  dataset: number | undefined,
  algorithm: number | undefined,
  image?: number,
  model: number | undefined
}) => {
  let algorithmVersion: AlgorithmVersion | undefined;
  if (algorithm !== undefined) {
    const selectAlgorithmVersion = await orm.em.findOne(AlgorithmVersion, { id: algorithm });

    if (!selectAlgorithmVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `algorithm version id ${algorithm} is not found`,
      });
    }
    algorithmVersion = selectAlgorithmVersion;
  }

  let datasetVersion: DatasetVersion | undefined;
  if (dataset !== undefined) {
    const selectDatasetVersion = await orm.em.findOne(DatasetVersion, { id: dataset });

    if (!selectDatasetVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `dataset version id ${dataset} is not found`,
      });
    }
    datasetVersion = selectDatasetVersion;
  }

  let modelVersion: ModalVersion | undefined;
  if (model !== undefined) {
    const selectedModelVersion = await orm.em.findOne(ModalVersion, { id: model });
    if (!selectedModelVersion) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `model version id ${model} is not found`,
      });
    }
    modelVersion = selectedModelVersion;
  }

  let imageOutput: Image | undefined;
  if (image !== undefined) {
    const existImage = await orm.em.findOne(Image, { id: image });

    if (!existImage) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `image id ${image} is not found`,
      });
    }
    imageOutput = existImage;
  }


  return {
    datasetVersion,
    algorithmVersion,
    modelVersion,
    image: imageOutput,
  };
};


export const checkAppExist = (apps: Record<string, AppConfigSchema>, appId: string) => {

  const app = apps[appId];
  if (!app) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `app id ${appId} is not found`,
    });
  }
  return app;
};
