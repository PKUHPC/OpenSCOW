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

import { Card, Space, Statistic } from "antd";
import React from "react";
import { styled } from "styled-components"; ;

interface Props {
  title: string
  newAddValue: number
  totalValue: number
  icon: React.ReactNode | React.ForwardRefExoticComponent<{}>;
  iconColor?: string
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;

const TotalCount = styled.div`
  align-self: flex-end;
  margin-left: 30px;
`;

const iconToNode = (Icon: any, color?: string) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon style={{ fontSize: 40, color }} />;
};


const StatisticCard: React.FC<Props> = ({ title, newAddValue, totalValue, icon, iconColor }) => {

  return (
    <Card bodyStyle={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "15px" } }>
      <Container>
        <Space>
          {iconToNode(icon, iconColor)}
          <Statistic
            title={title}
            value={newAddValue}
            precision={0}
            valueStyle={{ color: "red" }}
          />
        </Space>
      </Container>
      <TotalCount>总{title}: {totalValue}</TotalCount>
    </Card>
  );

};

export default StatisticCard;
