import { Space } from "antd";
import React from "react";
import { Media } from "src/styles/media";
import { RefreshLink } from "src/utils/refreshToken";
import styled from "styled-components";

const SpaceBetweenDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Container = styled.div`
  margin: 0 0 8px 0;
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
      <Media greaterThanOrEqual="md">
        <SpaceBetweenDiv>
          <TitleText>
            <Space>
              {beforeTitle}
              {titleText}
            </Space>
          </TitleText>
          {children}
          { reload ? <RefreshLink refresh={reload} /> : undefined}
        </SpaceBetweenDiv>
      </Media>
      <Media lessThan="md">
        <SpaceBetweenDiv>
          <TitleText>{titleText}</TitleText>
          { reload ? <RefreshLink refresh={reload} /> : undefined}
        </SpaceBetweenDiv>
        <div>
          {children}
        </div>
      </Media>
    </Container>
  );

};
