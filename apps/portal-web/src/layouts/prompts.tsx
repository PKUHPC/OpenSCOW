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
