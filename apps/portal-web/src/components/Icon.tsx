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

import React, { ComponentType, CSSProperties, ReactElement } from "react";
import { AllJobsIcon, DeskTopIcon, RunningJobIcon,
  ShellIcon, SubmitJobIcon, TemplatejobIcon } from "src/icons/EntryItemIcon";

const iconMap = {
  PlusCircleOutlined: <SubmitJobIcon />,
  BookOutlined: <RunningJobIcon />,
  SaveOutlined: <TemplatejobIcon />,
  DesktopOutlined: <DeskTopIcon />,
  MacCommandOutlined: <ShellIcon />,
  AllJobsOutlined:<AllJobsIcon />,
};

export type IconName = keyof typeof iconMap;
interface IconProps {
  name: IconName;
  style: CSSProperties;
}

export const Icon = (props: IconProps) => {
  const { name } = props;

  // 确保图标组件接收并应用 style 属性
  return React.cloneElement(iconMap[name], { style:props.style });
};


export function isSupportedIconName(iconName: string): iconName is IconName {
  return iconName in iconMap;
}

interface WithColorProps {
  color?: string;
  style?: CSSProperties;
}

const withColor = <P extends IconProps>(
  WrappedComponent: ComponentType<P & WithColorProps>,
): ComponentType<P & WithColorProps> => {
  return (props: P & WithColorProps): ReactElement => {
    const { color, style, ...restProps } = props;

    const modifiedStyle: CSSProperties = {
      color: color,
      ...style,
    };

    return <WrappedComponent {...restProps as P} style={modifiedStyle} />;
  };
};

export const ColoredIcon = withColor(Icon);



