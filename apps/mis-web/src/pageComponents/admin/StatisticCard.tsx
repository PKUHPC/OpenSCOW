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
  newAddValue: number | undefined
  totalValue: number | undefined
  loading: boolean
  icon: React.ReactNode | React.ForwardRefExoticComponent<{}>;
  iconColor?: string
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  flex: 1;
`;



const iconToNode = (Icon: any, color?: string) => {
  return React.isValidElement(Icon)
    ? Icon
    : <Icon style={{ fontSize: 40, color }} />;
};


const StatisticCard: React.FC<Props> = ({ title, newAddValue = 0, totalValue = 0, loading, icon, iconColor }) => {

  return (
    <Card bodyStyle={{ display: "flex", flexDirection: "row", justifyContent: "space-between", padding: "15px" } }>
      <Container>
        <Space>
          {iconToNode(icon, iconColor)}
          <Statistic
            title={title}
            value={newAddValue}
            precision={0}
            loading={loading}
            valueStyle={{ color: "#94070A" }}
          />
        </Space>
      </Container>
      <Statistic
        style={{ display: "flex", alignItems: "flex-end" }}
        title={`总${title}: `}
        value={totalValue}
        loading={loading}
        precision={0}
        valueStyle={{ color: "#94070A", marginLeft: "10px" }}
      />
    </Card>
  );

};

export default StatisticCard;
