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

import { Algorithm } from "src/entities/Algorithm";
import { AlgorithmVersion } from "src/entities/AlgorithmVersion";
import { Dataset } from "src/entities/Dataset";
import { DatasetVersion } from "src/entities/DatasetVersion";
import { Image } from "src/entities/Image";
import { Modal } from "src/entities/Modal";
import { ModalVersion } from "src/entities/ModalVersion";


export const entities = [
  Algorithm,
  AlgorithmVersion,
  Dataset,
  DatasetVersion,
  Image,
  Modal,
  ModalVersion,
];
