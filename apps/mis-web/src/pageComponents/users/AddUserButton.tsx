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

import { PlusOutlined } from "@ant-design/icons";
import { App, Button, Form, Input, Modal } from "antd";
import React, { useState } from "react";
import { api } from "src/apis";
import { CreateUserModal } from "src/pageComponents/users/CreateUserModal";
import { publicConfig } from "src/utils/config";
import { addUserToAccountParams, useBuiltinCreateUser, userIdRule } from "src/utils/createUser";


interface FormProps {
  identityId: string;
  name: string;
}

interface ModalProps {
  accountName: string;
  open: boolean;
  close: () => void;
  refresh: () => void;
  onAddUser: (identityId: string, name: string) => Promise<void>;
}

const NewUserModal: React.FC<ModalProps> = ({
  open, close, onAddUser: onAddingUser,
}) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm<FormProps>();

  return (
    <Modal
      title="添加用户"
      open={open}
      onCancel={close}
      onOk={async () => {
        const { identityId, name } = await form.validateFields();
        setLoading(true);
        onAddingUser(identityId, name).finally(() => setLoading(false));
      }}
      confirmLoading={loading}
    >
      <Form form={form}>
        <Form.Item
          name="identityId"
          label="用户ID"
          rules={[
            { required: true },
            ...userIdRule ? [userIdRule] : [],
          ]}
        >
          <Input placeholder={userIdRule?.message} />
        </Form.Item>
        <Form.Item name="name" required label="用户姓名">
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

interface Props {
  accountName: string;
  refresh: () => void;
  token: string;
}

export const AddUserButton: React.FC<Props> = ({ refresh, accountName, token }) => {

  const { message, modal } = App.useApp();

  const [modalShow, setModalShow] = useState(false);

  const [newUserInfo, setNewUserInfo] = useState<{ identityId: string; name: string } | undefined>(undefined);

  const onAddUser = async (identityId: string, name: string) => {
    await api.addUserToAccount({ body: { identityId, name, accountName } })
      .httpError(400, ({ code }) => {
        if (code === "ID_NAME_NOT_MATCH") {
          message.error("您输入的用户ID和姓名不匹配。");
        }
      })
      .httpError(404, ({ code }) => {
        if (code === "ACCOUNT_NOT_FOUND") {
          message.error("账户不存在");
        } else if (code === "USER_NOT_FOUND") {
          if (useBuiltinCreateUser()) {
            setModalShow(false);
            setNewUserInfo({ identityId, name });
          } else if (publicConfig.CREATE_USER_CONFIG.misConfig.type === "external") {

            modal.confirm({
              title: "用户不存在",
              content: "用户不存在，是否跳转到创建用户并添加到账户中页面？",
              okText: "跳转",
              onOk: () => {
                window.open(
                  publicConfig.CREATE_USER_CONFIG.misConfig.external!.url + "?" + addUserToAccountParams(
                    accountName, identityId, name, token,
                  ),
                  "_blank",
                );
              },
            });
          } else {
            message.error("用户不存在。请先创建用户");
          }
        }
      })
      .httpError(409, () => {
        message.error("用户已经存在于此账户中！");
      })
      .then(() => {
        message.success("添加成功！");
        refresh();
        setModalShow(false);
        setNewUserInfo(undefined);
      });
  };

  return (
    <>
      <NewUserModal
        close={() => setModalShow(false)}
        open={modalShow}
        refresh={refresh}
        accountName={accountName}
        onAddUser={onAddUser}
      />
      <CreateUserModal
        accountName={accountName}
        open={!!newUserInfo}
        newUserInfo={newUserInfo}
        onCreated={({ identityId, name }) => {
          return onAddUser(identityId, name);
        }}
        onClose={() => {
          setNewUserInfo(undefined);
        }}
      />
      <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalShow(true)}>
      添加用户
      </Button>
    </>
  );
};
