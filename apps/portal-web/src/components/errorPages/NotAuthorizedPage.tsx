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
          <Link href={"/api/auth"}>
            <Button type="primary">
              登录
            </Button>
          </Link>
        )}
      />
    </>
  );
};
