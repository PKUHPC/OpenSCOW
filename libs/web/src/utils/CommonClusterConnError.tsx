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

import { getCurrentLangLibWebTextArgs } from "./libWebI18n/libI18n";
import { getI18nConfigCurrentText } from "./systemLanguage";


// const libI18nClusterName = (clusterName: I18nStringType | undefined, languageId: string): string => {
//   return getI18nConfigCurrentText(clusterName, languageId);
// };

export const getClusterConnError =
  (languageId: string, clusterName: I18nStringType | undefined) => {

    const errorMessage = getCurrentLangLibWebTextArgs(
      languageId, "clusterConnError", [getI18nConfigCurrentText(clusterName, languageId)]);

    return errorMessage;
  };

export const getClusterAccountsConnError =
  (languageId: string, clusterName: I18nStringType | undefined) => {

    const errorMessage = getCurrentLangLibWebTextArgs(
      languageId, "clusterAccountsConnError", [getI18nConfigCurrentText(clusterName, languageId)]);

    return errorMessage;
  };

export const getClusterJobsConnError =
  (languageId: string, clusterName: I18nStringType | undefined) => {

    const errorMessage = getCurrentLangLibWebTextArgs(
      languageId, "clusterJobsConnError", [getI18nConfigCurrentText(clusterName, languageId)]);

    return errorMessage;
  };

export const getClusterAppsConnError =
  (languageId: string, clusterName: I18nStringType | undefined) => {

    const errorMessage = getCurrentLangLibWebTextArgs(
      languageId, "clusterAppsConnError", [getI18nConfigCurrentText(clusterName, languageId), "test!!!!!!"]);

    return errorMessage;
  };

