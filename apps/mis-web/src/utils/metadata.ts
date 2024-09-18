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

import { I18nStringType } from "@scow/config/build/i18n";
import { parsePlaceholder } from "@scow/lib-config/build/parse";
import { ChargeRecord } from "@scow/protos/build/server/charging";

import { publicConfig } from "./config";

const displayFormats = publicConfig.JOB_CHARGE_METADATA?.displayFormats;

// 定义替换占位符字段的格式化显示
export function formatMetadataDisplay(metadataValue: ChargeRecord["metadata"]): I18nStringType | undefined {

  if (!metadataValue) {
    return undefined;
  }

  if (typeof displayFormats === "string") {
    return parsePlaceholder(displayFormats, metadataValue, true);
  }

  if (typeof displayFormats === "object") {
    const i18nValue = displayFormats.i18n;
    return {
      i18n: {
        default: parsePlaceholder(i18nValue.default, metadataValue, true),
        zh_cn: i18nValue.zh_cn ? parsePlaceholder(i18nValue.zh_cn, metadataValue, true) : undefined,
        en: i18nValue.en ? parsePlaceholder(i18nValue.en, metadataValue, true) : undefined,
      },
    };
  }

  return JSON.stringify(metadataValue);
}
