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

import { languageMap } from "src/utils/languageMap";
import { nonEditableExtensions } from "src/utils/nonEditableExtensions";


export function basename(path: string) {
  const parts = path.split(/[/\\]/);
  return parts[parts.length - 1];
}

export function getExtension(filename: string) {
  const parts = filename.split(".");
  const extension = parts.pop();
  return extension ? extension.toLowerCase() : "";
}

export function isImage(filename: string): boolean {
  const imageExtensions = ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "svg", "webp"];
  const extension = getExtension(filename);
  return imageExtensions.includes(extension);
}

export function getLanguage(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  return languageMap[ext] || "plaintext";
}

export function canPreviewWithEditor(filename: string): boolean {
  const extension = `.${filename.split(".").pop()}`;
  return !nonEditableExtensions.has(extension.toLowerCase());
}


