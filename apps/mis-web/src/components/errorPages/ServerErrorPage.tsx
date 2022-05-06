import { Result } from "antd";
import React from "react";
import { Head } from "src/utils/head";

export const ServerErrorPage: React.FC = () => {
  return (
    <>
      <Head title="服务器出错" />
      <Result
        status="500"
        title="500"
        subTitle="对不起，服务器出错。请刷新重试。"
      />
    </>
  );
};
