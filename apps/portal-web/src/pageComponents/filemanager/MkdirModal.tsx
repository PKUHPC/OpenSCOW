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

import { App, Form, Input, Modal } from "antd";
import { join } from "path";
import { useState } from "react";
import { api } from "src/apis";

interface Props {
  open: boolean;
  onClose: () => void;
  reload: () => void;
  cluster: string;
  path: string;
}

interface FormProps {
  newFileName: string;
}

export const MkdirModal: React.FC<Props> = ({ open, onClose, path, reload, cluster }) => {

  const { message } = App.useApp();

  const [form] = Form.useForm<FormProps>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const { newFileName } = await form.validateFields();
    setLoading(true);
    await api.mkdir({ body: { cluster, path: join(path, newFileName) } })
      .httpError(409, () => { message.error("同名文件或目录已经存在！"); })
      .then(() => {
        message.success("创建成功");
        reload();
        onClose();
        form.resetFields();
      })
      .finally(() => setLoading(false));
  };

  return (
    <Modal
      open={open}
      title="创建目录"
      okText={"确认"}
      cancelText="取消"
      onCancel={onClose}
      confirmLoading={loading}
      destroyOnClose
      onOk={form.submit}
    >
      <Form form={form} onFinish={onSubmit}>
        <Form.Item label="要创建的目录的目录">
          <strong>{path}</strong>
        </Form.Item>
        <Form.Item<FormProps> label="目录名" name="newFileName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};
