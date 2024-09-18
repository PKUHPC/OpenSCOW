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

import { getI18nConfigCurrentText } from "@scow/lib-web/build/utils/systemLanguage";
import { useState } from "react";
import { LoginNode } from "src/utils/cluster";
export function LoginNodeStore(initLoginNodes: Record<string, LoginNode[]>, initLanguageId: string) {

  const [languageId, setLanguageId] = useState<string>(initLanguageId);
  const [loginNodes] = useState<Record<string, LoginNode[]>>(initLoginNodes);

  const getI18LoginNode = (loginNodes: Record<string, LoginNode[]>, languageId: string) => {
    const newLoginNodes: Record<string, LoginNode[]> = {};

    Object.keys(loginNodes).forEach((clusterId) => {
      const curLoginNodes = loginNodes[clusterId];
      newLoginNodes[clusterId] = curLoginNodes.map((loginNode) => ({
        name: getI18nConfigCurrentText(loginNode.name, languageId),
        address: loginNode.address,
      }));
    });
    return newLoginNodes;
  };

  return { loginNodes: getI18LoginNode(loginNodes, languageId), setLanguageId };
}
