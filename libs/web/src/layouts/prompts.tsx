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

import { message, Modal } from "antd";
import { MessageInstance } from "antd/es/message/interface";
import { ModalStaticFunctions } from "antd/es/modal/confirm";
import React from "react";

const MessageContext = React.createContext<MessageInstance>(undefined!);
const ModalContext = React.createContext<Omit<ModalStaticFunctions, "warn">>(undefined!);

export const useMessage = () => React.useContext(MessageContext);
export const useModal = () => React.useContext(ModalContext);

export const MessageProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [messageObj, contextProvider] = message.useMessage();

  return (
    <>
      {contextProvider}
      <MessageContext.Provider value={messageObj}>
        {children}
      </MessageContext.Provider>
    </>
  );
};

export const ModalProvider = ({ children }: React.PropsWithChildren<{}>) => {
  const [modal, contextProvider] = Modal.useModal();

  return (
    <>
      {contextProvider}
      <ModalContext.Provider value={modal}>
        {children}
      </ModalContext.Provider>
    </>
  );
};
