import { Tooltip } from "antd";
import React from "react";

interface Props {
  onClick?: () => void;
  disabled?: boolean;
  message?: React.ReactNode;
}

export const DisabledA: React.FC<Props> = React.forwardRef(({  onClick, disabled, message, children }, ref) => {

  if (!disabled) {
    return <a onClick={onClick}>{children}</a>;
  }

  if (message) {
    return (
      <Tooltip ref={ref as any} overlay={message}>
        <span>{children}</span>
      </Tooltip>
    );
  } else {
    return (
      <span ref={ref as any}>{children}</span>
    );
  }

});
