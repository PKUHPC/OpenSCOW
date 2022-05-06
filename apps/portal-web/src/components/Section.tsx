import React from "react";
import styled from "styled-components";

interface Props {
  title: React.ReactNode;
  extra?: React.ReactNode;
  className?: string;
}

const Container = styled.div`
`;

const Title = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const TitleText = styled.h3`
  font-weight: 700;
  font-size: 16px;
`;

export const Section: React.FC<Props> = ({ title, extra, children, className }) => {

  return (
    <Container className={className}>
      <Title>
        <TitleText>
          {title}
        </TitleText>
        {extra}
      </Title>
      {children}
    </Container>
  );
};
