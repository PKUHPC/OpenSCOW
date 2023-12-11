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

import { Button, Card, Form, Input, message, Modal, Radio, Table, Typography } from "antd";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoginBg } from "src/components/LoginBg";
import { confirmPasswordFormItemProps, passwordRule, phoneRegExp, phoneRule,
  verificationCodeRule } from "src/utils/form.js";
import { Head } from "src/utils/head"; ;
import { MessageType } from "antd/es/message/interface.js";
import { trpc } from "src/utils/trpc";
import { createQueryString } from "src/utils/url.js";
import { styled } from "styled-components";


const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const AgreeContainer = styled.div`
  margin-top: -15px;
  margin-bottom: 20px;
`;

const RegisterContainer = styled.div`
  position: relative;
  left: 15px;
  width: 420px;
  text-align: right;
`;

export default function Page() {

  const router = useRouter();

  const { data, isLoading, refetch } = trpc.dataset.list.useQuery({});


  return (
    <LoginBg top="10">
      <Head title="数据集"></Head>
      <Table
        rowKey="id"
        dataSource={data?.items}
        loading={isLoading}
        columns={[
          { dataIndex: "name", title: "资源名称" },
          { dataIndex: "id", title: "资源编号" },
          { dataIndex: "description", title: "资源介绍" },
        ]}
        pagination={ false }
      />
    </LoginBg>
  );
}
