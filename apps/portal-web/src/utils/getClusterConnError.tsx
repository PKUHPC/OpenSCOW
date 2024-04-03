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

import { I18nStringType } from "@scow/config/build/i18n";
import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { Lang } from "react-typed-i18n";
import { LangType, useI18n, useI18nTranslate } from "src/i18n";

export const getClusterConnError =
  (clusterName: I18nStringType | undefined, errorI18nKey: Lang<LangType>) => {

    const tArgs = useI18nTranslate();
    const languageId = useI18n().currentLanguage.id;
    const errorMessage = tArgs(errorI18nKey, [getI18nConfigCurrentText(clusterName, languageId)]);

    return errorMessage;

  };
