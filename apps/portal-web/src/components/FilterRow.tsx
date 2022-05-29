import { PropsWithChildren } from "react";
import { RefreshLink } from "src/utils/refreshToken";
import styled from "styled-components";

type Props = PropsWithChildren<{
  isLoading: boolean;
  reload: () => void;
}>;

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const FilterRow: React.FC<Props> = ({
  reload, children,
}) => {
  return (
    <Container>
      {children}
      <RefreshLink refresh={reload} />
    </Container>
  );
};
