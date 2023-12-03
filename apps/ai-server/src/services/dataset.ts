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

import { Code, ConnectError, ConnectRouter } from "@bufbuild/connect";
import { EntityManager, MikroORM, QueryOrder } from "@mikro-orm/core";
import { MySqlDriver, SqlEntityManager } from "@mikro-orm/mysql";
import {
  DatasetService,
} from "@scow/protos/build/ai/dataset_connect";
import { Dataset } from "src/entities/Dataset";
import { handlerLogger } from "src/utils/logger";
import { DEFAULT_PAGE_SIZE, paginationProps } from "src/utils/orm";

export const datasetServiceServer = (router: ConnectRouter, dbConnection: MikroORM<MySqlDriver>) => {
  router.service(DatasetService, {
    createDataset: async (request, context) => {

      const logger = handlerLogger(context);
      const em = dbConnection.em.fork();

      const { name, owner, type, scene, description } = request;

      const results = await em.findOne(Dataset, { name });
      if (results) {
        logger.warn(`Name ${name} already exists `);
        throw new ConnectError(`Name ${name} already exists `, Code.AlreadyExists);
      }

      logger.info("results: %o", results);

      const record = new Dataset({
        name, owner, type, scene, description,
      });

      await em.persistAndFlush(record);
      return { id: record.id };
    },

    listDataset: async (request, context) => {

      const logger = handlerLogger(context);
      const em = dbConnection.em.fork();
      return { results: [], totalCount: 0 };
    },

  });
};


