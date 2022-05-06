import { Button, ButtonProps } from "antd";
import React, { useState } from "react";

export interface CommonModalProps {
 visible: boolean;
 onClose: () => void;
}

export const ModalLink = <T,>(
  ModalComponent: React.ComponentType<CommonModalProps & T>,
) => (props: React.PropsWithChildren<Omit<T, keyof CommonModalProps>>) => {
    const [visible, setVisible] = useState(false);
    const { children, ...rest } = props;

    return (
      <>
        <a onClick={() => setVisible(true)}>
          {children}
        </a>
        {/** @ts-ignore */}
        <ModalComponent
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
          {...rest}
        />
      </>
    );

  };


export const ModalButton = <T,>(
  ModalComponent: React.ComponentType<CommonModalProps & T>,
  buttonProps?: ButtonProps,
) => (props: React.PropsWithChildren<Omit<T, keyof CommonModalProps>>) => {
    const [visible, setVisible] = useState(false);
    const { children, ...rest } = props;

    return (
      <>
        <Button onClick={() => setVisible(true)} {...buttonProps}>
          {children}
        </Button>
        {/** @ts-ignore */}
        <ModalComponent
          visible={visible}
          onClose={() => {
            setVisible(false);
          }}
          {...rest}
        />
      </>
    );

  };
