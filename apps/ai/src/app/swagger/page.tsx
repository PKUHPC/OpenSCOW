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

"use client";

// import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

import dynamic from "next/dynamic";
import { LoginBg } from "src/components/LoginBg";
import { Head } from "src/utils/head";
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function Page() {

  return (
    <LoginBg top="10">
      <Head title="数据集"></Head>
      <SwaggerUI url="/api/openapi.json" />
    </LoginBg>
  );
}
