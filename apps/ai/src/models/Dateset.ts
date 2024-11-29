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

import { prefix } from "src/i18n";

import { TextsTransType } from "./Algorithm";

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

export const SceneTypeText = {
  CWS: "中文分词",
  DA: "数据增强",
  IC: "图像分类",
  OD: "目标检测",
  OTHER: "其他",
};

const p = prefix("app.dataset.model.");

export const getDatasetTexts = (t: TextsTransType) => {

  return {
    all:t(p("all")),
    image:t(p("image")),
    text:t(p("text")),
    video:t(p("video")),
    audio:t(p("audio")),
    other:t(p("other")),
    ces:t(p("ces")),
    da:t(p("da")),
    ic:t(p("ic")),
    od:t(p("od")),
  };

};
