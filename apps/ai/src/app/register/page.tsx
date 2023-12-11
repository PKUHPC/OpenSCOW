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

import { Button, Card, Form, Input, message, Modal, Radio, Typography } from "antd";
import { MessageType } from "antd/es/message/interface.js";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { LoginBg } from "src/components/LoginBg.jsx";
import { confirmPasswordFormItemProps, passwordRule, phoneRegExp, phoneRule,
  verificationCodeRule } from "src/utils/form.js";
import { Head } from "src/utils/head";
import { trpc } from "src/utils/trpc";
import { createQueryString } from "src/utils/url.js";
import { styled } from "styled-components";



export interface RegisterUserFormFields {
  loginName: string;
  name: string;
  phone: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

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

export default function Page({ searchParams }: {searchParams: { phone?: string; }}) {

  const router = useRouter();

  const [form] = Form.useForm<RegisterUserFormFields>();
  const [agree, setAgree] = useState(false);

  const [countdown, setCountdown] = useState(60); // 验证码倒计时
  const [isCounting, setIsCounting] = useState(false); // 是否正在倒计时
  // 提示正在发送验证码的回调，执行可隐藏提示框
  const hide = useRef<MessageType>();

  const [{ confirm }, confirmModalHolder] = Modal.useModal();



  return (
    <LoginBg top="10">
      <Head title="注册"></Head>
      <Card style={{ width: 500 }}>
        <FormContainer>
          <Typography.Title level={2} style={{ margin:"20px 0 40px 0" }}>账号注册</Typography.Title>
          <Form
            form={form}
            style={{ width:420 }}
          >
            <Form.Item
              name="loginName"
              rules={[{ required: true, message:"请输入用户名" }]}
            >
              <Input placeholder='用户名' size="large" />
            </Form.Item>
            <Form.Item name="name" rules={[{ required: true, message:"请输入姓名" }]}>
              <Input placeholder='姓名' size="large" />
            </Form.Item>
            <Form.Item
              name="phone"
              rules={[{ required: true, message:"请输入手机号" }, phoneRule]}
              initialValue={searchParams.phone ?? ""}
            >
              <Input placeholder='手机号' size="large" />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required:true, message:"请输入密码" }, passwordRule]}
            >
              <Input.Password placeholder={"密码:" + passwordRule.message} size="large" />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              hasFeedback
              {...confirmPasswordFormItemProps(form, "password")}
            >
              <Input.Password placeholder={passwordRule.message} size="large" />
            </Form.Item>
            <AgreeContainer>
              <Radio checked={agree} onClick={() => setAgree(!agree)}>同意</Radio>
              <Button type="link" style={{ padding:"0", marginLeft:"-15px" }}>《XSCOW用户协议》</Button>
            </AgreeContainer>
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                size="large"
                style={{ marginBottom:"10px", fontSize:"20px", lineHeight:"20px" }}
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </FormContainer>
        <RegisterContainer>
          <span>已有账号
            <Button type="link" style={{ padding:"0" }} onClick={() => router.push("/login/user")}>去登陆 </Button>
          </span>
        </RegisterContainer>
      </Card>
      {/* antd中modal组件 */}
      {confirmModalHolder}
    </LoginBg>
  );
}
