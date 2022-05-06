import styled from "styled-components";

const FooterContainer = styled.div`
  display: flex;
  justify-content: center;

  margin-bottom: 8px;
  // https://v1.tailwindcss.com/docs/text-color text-gray-500
  color: #a0aec0;
`;

interface Props {
  text: string;
}

export const Footer: React.FC<Props> = ({ text }) => {
  return (
    <FooterContainer>
      {text}
    </FooterContainer>
  );
};

