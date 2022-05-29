import { message,notification } from "antd";
import { MessageInstance } from "antd/lib/message";
import { NotificationInstance } from "antd/lib/notification";
import React, { useMemo } from "react";

const AntdContextHelperContext =
  React.createContext<{
    notification: NotificationInstance;
    message: MessageInstance;
  } | undefined>(undefined);

type Props = React.PropsWithChildren<{}>;

export const AntdContextHelper: React.FC<Props> = ({ children }) => {
  const [notifyApi, contextHolder] = notification.useNotification();
  const [messageApi, mch] = message.useMessage();

  const value = useMemo(
    () => ({ notification: notifyApi, message: messageApi }),
    [notifyApi, messageApi]);

  return (
    <AntdContextHelperContext.Provider value={value}>
      {contextHolder}
      {mch}
      {children}
    </AntdContextHelperContext.Provider>
  );
};

export function useNotification() {
  return React.useContext(AntdContextHelperContext)!.notification;
}

export function useMessage() {
  return React.useContext(AntdContextHelperContext)!.message;
}
