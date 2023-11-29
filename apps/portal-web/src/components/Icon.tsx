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

import { BookOutlined, DesktopOutlined, MacCommandOutlined, PlusCircleOutlined, SaveOutlined } from "@ant-design/icons";
import React, { CSSProperties } from "react";

const iconMap = {
  PlusCircleOutlined: <PlusCircleOutlined />,
  BookOutlined: <BookOutlined />,
  SaveOutlined: <SaveOutlined />,
  DesktopOutlined: <DesktopOutlined />,
  MacCommandOutlined: <MacCommandOutlined />,
};

export const Icon = (props: { name: string, style: CSSProperties }) => {
  const { name } = props;

  // 确保图标组件接收并应用 style 属性
  const iconElement = iconMap[name];
  if (!iconElement) return null;

  return React.cloneElement(iconElement, { style:props.style });
};

const withColor = (WrappedComponent) => {
  return (props) => {
    const { color, style, ...restProps } = props;

    const modifiedStyle = {
      color: color || "black",
      ...style,
    };

    return <WrappedComponent style={modifiedStyle} {...restProps} />;
  };
};

export const ColoredIcon = withColor(Icon);

