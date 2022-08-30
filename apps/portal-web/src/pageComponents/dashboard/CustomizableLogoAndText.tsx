import { Divider } from "antd";
import Image from "next/image";
import { join } from "path";
import React from "react";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";

interface Props {
  hostname: string | undefined;
}

const Container = styled.div`
`;

const Logo = styled.div`
  position: relative;
  width: 100%;
  padding-bottom: 8%;
`;

const TitleAndText = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 3%;
  margin-left: 20%;
  margin-right: 20%;
  flex-direction: column;
`;

const Title = styled.h1`
  align-self: center;
`;

const Text = styled.p`
  text-indent: 2rem ;
`;

export const CustomizableLogoAndText: React.FC<Props> = ({ hostname }) => {

  return (
    <Container>
      <Logo >
        <Image
          alt="logo"
          src={join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/logo")}
          layout="fill"
          objectFit="contain"
        />
      </Logo>
      <TitleAndText>
        <Title>
          {(hostname && publicConfig.HOME_TITLES[hostname]) ?? publicConfig.DEFAULT_HOME_TITLE}
        </Title>
        <Divider />
        <Text>
          {(hostname && publicConfig.HOME_TEXTS[hostname]) ?? publicConfig.DEFAULT_HOME_TEXT}
        </Text>
      </TitleAndText>
    </Container>

  );
};
