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

import { forwardRef, HTMLAttributes } from "react";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

export type CardItemProps = HTMLAttributes<HTMLDivElement> & {
  draggable: boolean;
  transparent?: boolean;
  isDragging?: boolean;
};


export type EntryCardItemProps = CardItemProps & {
  entryBaseName: string,
  entryExtraInfo?: string[];
  id: string,
  icon?: string,
  logoPath?: string;
};

export const EntryCardItem = forwardRef<HTMLDivElement, EntryCardItemProps>
(({ entryBaseName, entryExtraInfo, icon, logoPath, children, ...props }, ref) => {

  return (
    <CardItem ref={ref} {...props}>
      <EntryItem
        entryBaseName={entryBaseName}
        icon={icon}
        logoPath={logoPath}
        entryExtraInfo={entryExtraInfo}
      />

    </CardItem>
  );
});

const CardItemContainer = styled.div<{
  draggable?: boolean;
  isDragging?: boolean;
  transparent?: boolean;
}>`
  cursor: ${(props) => props.draggable ? (props.isDragging ? "grabbing" : "grab") : "pointer"};
  opacity: ${((props) => props.transparent ? "0.5" : "1")};
  transform: ${(props) => props.isDragging ? "scale(1.05)" : "scale(1)"};
  box-shadow: ${(p) => p.theme.token.boxShadowSecondary};

  background-color: ${(p) => p.theme.token.colorBgElevated};

  padding: 8px;
  height: 172px;
  min-width: 148px;
`;

export const CardItem = forwardRef<HTMLDivElement, CardItemProps>
(({ children, ...props }, ref) => {

  return (
    <CardItemContainer ref={ref} {...props}>
      {children}
    </CardItemContainer>
  );
});

