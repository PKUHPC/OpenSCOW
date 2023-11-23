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
import React, { CSSProperties, forwardRef, HTMLAttributes } from "react";
import { Cluster } from "src/utils/config";
import { styled } from "styled-components";

import { EntryItem } from "./EntryItem";

const Container = styled.div`
  .ant-card-body {
    padding: 16px 16px 5px 16px !important;
    border-radius: 0 0 8px 8px !important;
  }
`;

export type ItemProps = HTMLAttributes<HTMLDivElement> & {
    draggable: boolean,
    name: string,
    id: string,
    cluster?: Cluster,
    icon?: string,
    logoPath?: string;
    withOpacity?: boolean;
    isDragging?: boolean;
};

const CardItem = forwardRef<HTMLDivElement, ItemProps>
(({ draggable, withOpacity, isDragging, style, ...props }, ref) => {
  const inlineStyles: CSSProperties = {
    cursor:draggable ?
      isDragging ? "grabbing" : "grab" :
      "default",
    opacity: withOpacity ? "0.5" : "1",
    boxShadow: isDragging ?
      "rgb(63 63 68 / 5%) 0px 2px 0px 2px, rgb(34 33 81 / 15%) 0px 2px 3px 2px" :
      "rgb(63 63 68 / 5%) 0px 0px 0px 1px, rgb(34 33 81 / 15%) 0px 1px 3px 0px",
    transform: isDragging ? "scale(1.05)" : "scale(1)",
    margin:"20px",
    ...style,
  };

  return (
    <Container ref={ref} {...props}>
      <Card style={inlineStyles}>
        <EntryItem {...props}></EntryItem>
      </Card>
    </Container>
  );
});

export default CardItem;
