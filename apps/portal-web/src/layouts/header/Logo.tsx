import Link from "next/link";
import { join } from "path";
import styled from "styled-components";

const LogoContainer = styled.h1`
  color: var(--ant-primary-color);
  margin-bottom: 0;

  img {
    margin-bottom: 4px;
  }
`;

export const Logo = () => {

  return (
    <LogoContainer>
      <Link href="/">

        <img height="40px" src={join(process.env.NEXT_PUBLIC_BASE_PATH || "", "/api/icon?type=favicon")} />

      </Link>
    </LogoContainer>
  );
};
