/**
 * Copyright (c) 2022 Peking University and Peking University Institute for Computing and Digital Economy
 * OpenSCOW is licensed under Mulan PSL v2.
 * You can use this software according to the terms and conditions of the Mulan PSL v2.
 * You may obtain a copy of Mulan PSL v2 at:
 *          http://license.coscl.org.cn/MulanPSL2
 * THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
 * EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
 * MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
 * See the Mulan PSL v2 for more details.
 */

"use client";

import { App, Form, Input, Modal } from "antd";
import { join } from "path";
import { trpc } from "src/utils/trpc";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: (() => void) | ((dirName: string) => Promise<void>);
  clusterId: string;
  path: string;
}

interface FormProps {
  newDirName: string;
}

export const MkdirModal: React.FC<Props> = ({ open, onClose, path, reload, clusterId }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<FormProps>();

  const mutation = trpc.file.mkdir.useMutation({
    onSuccess: () => {
      message.success("创建成功");
      reload(form.getFieldValue("newDirName"));
      onClose();
      form.resetFields();
    },
    onError: (e) => {
      if (e.data?.code === "CONFLICT") {
        message.error("已存在同名目录");
      }
    },
  });

  const onSubmit = async () => {
    const { newDirName } = await form.validateFields();

    mutation.mutate({
      path: join(path, newDirName), clusterId,
    });
  };

  return (
    <Modal
      open={open}
      title="创建目录"
      okText={"确认"}
      cancelText="取消"
      onCancel={onClose}
      confirmLoading={mutation.isLoading}
      destroyOnClose
      onOk={form.submit}
    >
      <Form form={form} onFinish={onSubmit}>
        <Form.Item label="要创建的目录的目录">
          <strong>{path}</strong>
        </Form.Item>
        <Form.Item label="目录名" name="newDirName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
