import { Card } from "antd";
import React from "react";
import styled from "styled-components";

type Props = React.PropsWithChildren<{
  title: React.ReactNode;
}>;

const Title = styled.h3`
  font-weight: 600;
`;

const ChildrenContainer = styled.div`
  display: flex;
  align-items: center;
  height: 100%;
  flex: 1;
`;


export const StatCard: React.FC<Props> = ({ children, title }) => {
  return (
    <Card
      style={{ height: "100%" }}
      bodyStyle={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Title>
        {title}
      </Title>
      <ChildrenContainer>
        {children}
      </ChildrenContainer>
    </Card>
  );
};

