import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  #nprogress .bar {
    background-color: ${({ theme }) => theme.token.colorPrimary};
  }

 // HACK
  a {
    color: ${({ theme }) => theme.token.colorPrimary};
  }
`;


