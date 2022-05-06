import { Result } from "antd";
import { NextPage } from "next";

export const NoAccountPage: NextPage = () => {
  return (
    <Result
      status="warning"
      title="没有可以管理的账户"
      subTitle=""
      extra={
        <p>
          请访问 http://hpc.pku.edu.cn/guide.html 查看如何开户。
        </p>
      }
    />
  );
};

export default NoAccountPage;
