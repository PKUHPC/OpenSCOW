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

import { createFromIconfontCN } from "@ant-design/icons";
import React from "react";

interface Props {
  scriptUrls?: string[];
  type: string;
}

export const IconFont: React.FC<Props> = ({ scriptUrls, type }) => {
  const defaultScriptUrl = "//at.alicdn.com/t/c/font_4071713_6zxyzqrl1yb.js"; // Ant Design 3.0 全新线性图标体系
  const newScriptUrls = scriptUrls && scriptUrls.length > 0 ? scriptUrls : [defaultScriptUrl];
  const IconFontCN = createFromIconfontCN({
    scriptUrl: newScriptUrls,
  });
  return <IconFontCN type={type} />;
};
