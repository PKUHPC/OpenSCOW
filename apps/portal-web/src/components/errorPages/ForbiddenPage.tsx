import { Result } from "antd";
import React from "react";
import { Head } from "src/utils/head";

// eslint-disable-next-line @typescript-eslint/no-unused-vars

interface Props {
  title?: React.ReactNode;
  subTitle?: React.ReactNode;
}

export const ForbiddenPage: React.FC<Props> = ({
  title = "不允许访问此页面",
  subTitle = "系统不允许您访问此页面。",
}) => {
  return (
    <>
      <Head title="不允许访问" />
      <Result
        status="403"
        title={title}
        subTitle={subTitle}
      />
    </>
  );
};
