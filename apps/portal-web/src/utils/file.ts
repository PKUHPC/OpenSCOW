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

import { CloseOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons";
import { join } from "path";
import { FilterFormContainer } from "src/components/FilterFormContainer";
import { FileInfo, FileType } from "src/pages/api/file/list";
import { styled } from "styled-components";
import CryptoJS from "crypto-js";



export type FileInfoKey = React.Key;

export const fileInfoKey = (f: FileInfo, path: string): FileInfoKey => join(path, f.name);

export const TopBar = styled(FilterFormContainer)`
  display: flex;
  flex-direction: row;
  padding-bottom: 8px;
  &>button {
    margin: 0px 4px;
  }
`;

export const fileTypeIcons = {
  "FILE": FileOutlined,
  "DIR": FolderOutlined,
  "ERROR": CloseOutlined,
} as Record<FileType, React.ComponentType>;

export const nodeModeToString = (mode: number) => {
  const numberPermission = (mode & parseInt("777", 8)).toString(8);

  const toStr = (char: string) => {
    const num = +char;
    return ((num & 4) !== 0 ? "r" : "-") + ((num & 2) !== 0 ? "w" : "-") + ((num & 1) !== 0 ? "x" : "-");
  };

  return [0, 1, 2].reduce((prev, curr) => prev + toStr(numberPermission[curr]), "");
};

export const openPreviewLink = (href: string) => {
  window.open(href, "ViewFile", "location=yes,resizable=yes,scrollbars=yes,status=yes");
};

export const generateMD5FromFileName = (file: File) => {
  const filename = file.name;
  const md5 = CryptoJS.MD5(filename).toString();

  // 通过正则获取文件后缀
  const reg = /\.([a-zA-Z0-9]+)$/.exec(filename);
  const suffix = reg ? reg[1] : "";

  return { md5, suffix };
};

// 获取文件的块数
export const getFileChunkSize = (file: File) => {
  const singleChunkSize = 10; // 10 MB
  let chunkSize = singleChunkSize * 1024 * 1024;

  const count = Math.ceil(file.size / chunkSize);


  return { chunkSize, totalCount: count };
};
