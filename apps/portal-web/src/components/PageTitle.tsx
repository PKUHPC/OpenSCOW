import { Space } from "antd";
import React from "react";
import { RefreshLink } from "src/utils/refreshToken";
import styled from "styled-components";

const Container = styled.div`
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const TitleText = styled.h1`
  font-weight: 700;
  font-size: 16px;
`;

interface PageTitleProps {
  beforeTitle?: React.ReactNode;
  titleText: React.ReactNode;
  isLoading?: boolean;
  reload?: () => void;
}


export const PageTitle: React.FC<PageTitleProps> = ({
  beforeTitle, titleText, reload, children,
}) => {
  return (
    <Container>
      <TitleText>
        <Space>
          {beforeTitle}
          {titleText}
        </Space>
      </TitleText>
      {children}
      { reload ? <RefreshLink refresh={reload} /> : undefined}
    </Container>
  );

};
