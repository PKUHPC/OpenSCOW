/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * SCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

import { Button, ButtonProps } from "antd";
import React, { useState } from "react";

export interface CommonModalProps {
 open: boolean;
 onClose: () => void;
}

export const ModalLink = <T,>(
  ModalComponent: React.ComponentType<CommonModalProps & T>,
) => (props: React.PropsWithChildren<Omit<T, keyof CommonModalProps>>) => {
    const [open, setOpen] = useState(false);
    const { children, ...rest } = props;

    return (
      <>
        <a onClick={() => setOpen(true)}>
          {children}
        </a>
        {/** @ts-ignore */}
        <ModalComponent
          open={open}
          onClose={() => {
            setOpen(false);
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
    const [open, setOpen] = useState(false);
    const { children, ...rest } = props;

    return (
      <>
        <Button onClick={() => setOpen(true)} {...buttonProps}>
          {children}
        </Button>
        {/** @ts-ignore */}
        <ModalComponent
          open={open}
          onClose={() => {
            setOpen(false);
          }}
          {...rest}
        />
      </>
    );

  };
