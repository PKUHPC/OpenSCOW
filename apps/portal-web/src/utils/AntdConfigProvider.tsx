import { ConfigProvider } from "antd";
import zhCN from "antd/lib/locale/zh_CN";
import moment from "moment";
import React, { useEffect } from "react";

moment.locale("zh-CN");

type Props = React.PropsWithChildren<{
  color: string;
}>;

export const AntdConfigProvider: React.FC<Props> = ({ children, color }) => {

  useEffect(() => {
    ConfigProvider.config({
      theme: {
        primaryColor: color,
      },
    });
  }, []);

  return (
    <ConfigProvider locale={zhCN} >
      {children}
    </ConfigProvider>
  );
};
