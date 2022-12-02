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

import { Alert, Button, Form, Typography } from "antd";
import { useState } from "react";
import { api } from "src/apis";
import { Centered } from "src/components/layouts";
import { FormLayout } from "src/layouts/FormLayout";
import { useMessage, useModal } from "src/layouts/prompts";
import { CreateUserForm, CreateUserFormFields } from "src/pageComponents/users/CreateUserForm";
import { publicConfig } from "src/utils/config";
import styled from "styled-components";


type FormFields = Omit<CreateUserFormFields, "confirmPassword">;

const AlertContainer = styled.div`
  margin-bottom: 16px;
`;

export const InitAdminForm: React.FC = () => {
  const [form] = Form.useForm<FormFields>();

  const message = useMessage();
  const modal = useModal();

  const [loading, setLoading] = useState(false);
  const onFinish = async () => {
    const { email, identityId, name, password } = await form.validateFields();
    setLoading(true);
    const result = await api.userExists({ body: { identityId } });
    if (result.existsInScow) {
      // 如果在scow中已经存在这个用户，则不用创建操作
      modal.error({
        title: "用户已存在",
        content: "用户已存在于SCOW数据库，无法再添加此用户",
        okText: "确认",
        onOk: async () => {
          setLoading(false);
        },
      });
    } else if (!result.existsInAuth && result.existsInAuth !== undefined && !publicConfig.ENABLE_CREATE_USER) {
      // 用户不存在于scow: 且认证系统支持查询，且查询结果不存在于认证系统，且当前系统不支持创建用户
      modal.confirm({
        title: "用户不存在于认证系统",
        content: "用户不存在，请确认用户ID是否正确",
        okText: "确认",
        onOk: async () => {
          setLoading(false);
        },
        onCancel: async () => {
          setLoading(false);
        },
      });
    } else {
      // 其他情况：
      // 情况1.用户不存在于scow && 认证系统支持查询 && 存在于认证系统 ->数据库创建
      // 情况2：用户不存在于scow && 认证系统支持查询 &&不存在于认证系统 && 系统支持创建用户 -> 认证系统创建用户->数据库创建
      // 情况1与2合并为：用户不存在于scow && 认证系统支持查询 &&(存在于认证系统 || (不存在于认证系统 && 系统支持创建用户))
      // 情况3.用户不存在于scow && 认证系统不支持查询->判断认证系统是否支持创建用户 ->数据库创建->尝试->认证系统创建
      // result.existsInAuth ? "此用户存在于已经认证系统，确认添加为初始管理员？" : "用户不存在，是否确认创建此用户并添加为初始管理员？",
      modal.confirm({
        title: "提示",
        content: result.existsInAuth !== undefined ?
          // 认证系统支持查询
          result.existsInAuth ? "此用户存在于已经认证系统，确认添加为初始管理员？" : "用户不存在于认证系统，是否确认创建此用户并添加为初始管理员？"
          : // 认证系统不支持查询
          publicConfig.ENABLE_CREATE_USER ?
            "无法确认用户是否在认证系统中存在， 将会尝试在认证系统中创建" : "无法确认用户是否在认证系统中存在，并且当前认证系统不支持创建用户，请您确认此用户已经在认证系统中存在，确认将会直接加入到数据库中。",
        okText: "确认",
        onCancel: () => {
          setLoading(false);
        },
        onOk: async () => {
          await api.createInitAdmin(
            { body: { email, identityId, name, password } })
            .httpError(409, (e) => { 
              if (e.code === "ALREADY_EXISTS_IN_SCOW")
                modal.error({
                  title: "添加失败",
                  content: "此用户存在于scow数据库",
                  okText: "确认",
                });
            })
            .then((createdInAuth) => { 
              createdInAuth.createdInAuth ? 
                modal.info({
                  title: "添加成功",
                  content: "此用户存在于认证系统中，已成功添加到SCOW数据库",
                  okText: "确认",
                })
                : message.success("添加完成！"); })
            .catch(() => {               
              modal.error({
                title: "添加失败",
                content: "创建用户失败",
              });  
            }) 
            .finally(() => {
              form.resetFields();
              setLoading(false);
            });
        },
      });
    }

  };
  return (
    <Centered>
      <FormLayout maxWidth={800}>
        <Typography.Paragraph>您可以在此创建初始管理员用户。</Typography.Paragraph>
        <Typography.Paragraph>
          这里添加的用户为初始管理员，位于默认租户中，将会自动拥有<strong>平台管理员</strong>和<strong>默认租户的租户管理员</strong>角色。
        </Typography.Paragraph>
        <AlertContainer>
          <Alert
            type={publicConfig.ENABLE_CREATE_USER ? "success" : "warning"} 
            message={publicConfig.ENABLE_CREATE_USER ? "当前认证系统支持创建用户，您可以选择加入一个已存在于认证系统的用户，或者创建一个全新的用户。系统将会在认证系统中创建此用户"
              : "当前认证系统不支持创建用户，请确认要添加的用户必须已经存在于认证系统，且用户的ID必须和认证系统中的用户ID保持一致"}
          />
        </AlertContainer>
        <Form form={form} onFinish={onFinish}>
          <CreateUserForm />
          <Centered>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
              添加
              </Button>
            </Form.Item>
          </Centered>
        </Form>
      </FormLayout>
    </Centered>
  );
};
