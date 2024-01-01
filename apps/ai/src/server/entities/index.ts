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

import { Algorithm, algorithmEntitySchema } from "src/server/entities/Algorithm";
import { AlgorithmVersion } from "src/server/entities/AlgorithmVersion";
import { Dataset } from "src/server/entities/Dataset";
import { DatasetVersion } from "src/server/entities/DatasetVersion";
import { Image } from "src/server/entities/Image";
import { Modal } from "src/server/entities/Modal";
import { ModalVersion } from "src/server/entities/ModalVersion";


export const entities = [
  algorithmEntitySchema,
  // algorithmVersionEntitySchema,
  // datasetEntitySchema,
  // datasetVersionEntitySchema,
  // imageEntitySchema,
  // modalEntitySchema,
  // modalVersionEntitySchema,
];
