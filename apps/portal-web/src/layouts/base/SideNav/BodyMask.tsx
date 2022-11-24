import styled from "styled-components";

interface Props {
  sidebarShown: boolean;
  breakpoint: number;
  onClick: () => void;
}

type MaskProps = Pick<Props, "sidebarShown" | "breakpoint">;

const Mask = styled.div<MaskProps>`
  position: absolute;
  left: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.35);
  z-index:2;

  display: none;

  @media (max-width: ${(props: MaskProps) => props.breakpoint}px) {
    display: ${(props: MaskProps) => props.sidebarShown ? "initial" : "none"};
  }
`;

export default function BodyMask(props: Props) {

  return (
    <Mask
      onClick={props.onClick}
      breakpoint={props.breakpoint}
      sidebarShown={props.sidebarShown}
    />
  );
}
