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

import { Card } from "antd";
import { CSSProperties, forwardRef, HTMLAttributes } from "react";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

const Container = styled.div`
`;

export type CardItemProps = HTMLAttributes<HTMLDivElement> & {
  draggable: boolean;
  transparent?: boolean;
  isDragging?: boolean;
};


export type EntryCardItemProps = CardItemProps & {
  entryBaseName: string,
  entryExtraInfo?: string;
  id: string,
  icon?: string,
  logoPath?: string;
};

export const EntryCardItem = forwardRef<HTMLDivElement, EntryCardItemProps>
(({ entryBaseName, entryExtraInfo, icon, logoPath, children, ...props }, ref) => {

  return (
    <CardItem ref={ref} {...props}>
      <EntryItem entryBaseName={entryBaseName} icon={icon} logoPath={logoPath} entryExtraInfo={entryExtraInfo} />
    </CardItem>
  );
});

export const CardItem = forwardRef<HTMLDivElement, CardItemProps>
(({ draggable, transparent, isDragging, style, children, ...props }, ref) => {
  const inlineStyles: CSSProperties = {
    cursor:draggable ?
      isDragging ? "grabbing" : "grab"
      : "pointer",
    opacity: transparent ? "0.5" : "1",
    boxShadow: isDragging ?
      "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px" :
      "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
    transform: isDragging ? "scale(1.05)" : "scale(1)",
    ...style,
    padding: "8px",
    height: "172px",
  };

  return (
    <Container ref={ref} {...props}>
      <Card style={inlineStyles}>
        {children}
      </Card>
    </Container>
  );
});

