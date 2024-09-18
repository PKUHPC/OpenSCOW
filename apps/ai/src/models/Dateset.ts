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

export enum DatasetType {
  IMAGE = "IMAGE",
  TEXT = "TEXT",
  VIDEO = "VIDEO",
  AUDIO = "AUDIO",
  OTHER = "OTHER",
}

export enum SceneType {
  CWS = "CWS",
  DA = "DA",
  IC = "IC",
  OD = "OD",
  OTHER = "OTHER",
}

export const DatasetTypeText: Record<string, string> = {
  IMAGE: "图像",
  TEXT: "文本",
  VIDEO: "视频",
  AUDIO: "音频",
  OTHER: "其他",
};

export const SceneTypeText: Record<string, string> = {
  CWS: "中文分词",
  DA: "数据增强",
  IC: "图像分类",
  OD: "目标检测",
  OTHER: "其他",
};
