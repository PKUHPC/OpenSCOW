import { Button, Result } from "antd";
import Link from "next/link";
import { Head } from "src/utils/head";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const NotAuthorizedPage = () => {

  return (
    <>
      <Head title="需要登录" />
      <Result
        status="403"
        title="需要登录"
        subTitle="您未登录或者登录状态已经过期。您需要登录才能访问此页面。"
        extra={(
          <Button type="primary">
            <Link href={"/api/auth"}>
            登录
            </Link>
          </Button>
        )}
      />
    </>
  );
};
