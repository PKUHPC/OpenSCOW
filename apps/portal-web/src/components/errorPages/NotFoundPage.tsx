import { Result } from "antd";
import { Head } from "src/utils/head";

export const NotFoundPage = () => {
  return (
    <>
      <Head title="不存在" />
      <Result
        status="404"
        title={"404"}
        subTitle={"您所请求的页面不存在。"}
      />
    </>
  );
};
