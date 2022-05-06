import Link from "next/link";
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
        <a>
          <img height="40px" src="/api/icon?type=favicon" />
        </a>
      </Link>
    </LogoContainer>
  );
};
