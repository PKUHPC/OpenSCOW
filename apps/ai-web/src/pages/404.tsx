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

import Link from "next/link";
import type { FC } from "react";
import { BaseLayout } from "src/layout/BaseLayout";

const NotFound: FC = () => (
  <BaseLayout>
    <div className="w-full h-full flex flex-col justify-center items-center text-center">
      <div className="text-8xl font-bold">
        404
      </div>

      <div className="mt-1">
        Couldn&apos;d find the page you are looking for.
      </div>

      <div>
        You can try and check the page&apos;s address, or return to
         the <Link href="/" className="underline" replace>home page</Link>.
      </div>
    </div>
  </BaseLayout>
);

export default NotFound;
