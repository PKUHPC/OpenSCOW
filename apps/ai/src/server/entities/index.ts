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

import { algorithmEntitySchema } from "src/server/entities/Algorithm";
import { algorithmVersionEntitySchema } from "src/server/entities/AlgorithmVersion";
import { datasetEntitySchema } from "src/server/entities/Dataset";
import { datasetVersionEntitySchema } from "src/server/entities/DatasetVersion";
import { imageEntitySchema } from "src/server/entities/Image";
import { modelEntitySchema } from "src/server/entities/Model";
import { modelVersionEntitySchema } from "src/server/entities/ModelVersion";


export const entities = [
  algorithmEntitySchema,
  algorithmVersionEntitySchema,
  datasetEntitySchema,
  datasetVersionEntitySchema,
  imageEntitySchema,
  modelEntitySchema,
  modelVersionEntitySchema,
];
