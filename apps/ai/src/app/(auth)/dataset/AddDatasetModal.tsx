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

import { App, Form, Input, Modal, Select } from "antd";
import React, { useEffect } from "react";
import { DatasetType, DatasetTypeText, SceneType, SceneTypeText } from "src/models/Dateset";
import { trpc } from "src/utils/trpc";

export interface Props {
  open: boolean;
  onClose: () => void;
  owner: string;
}

interface FormFields {
  name: string,
  type: DatasetType,
  scene: SceneType,
  description?: string,
}

export const AddDatasetModal: React.FC<Props> = (
  { open, onClose, owner },
) => {
  const [form] = Form.useForm<FormFields>();
  const { message } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({
      type: DatasetType.IMAGE,
      scene: SceneType.CWS,
    });
  }, []);

  const mutation = trpc.dataset.createDataset.useMutation({
    onSuccess() {
      message.success("添加数据集成功");
      onClose();
    },
    onError(e) {
      console.log(e);
      message.error("添加数据集失败");
      // if (e.data?.code === "USER_NOT_FOUND") {
      //   message.error("用户未找到");
      // } else if (e.data?.code === "ACCOUNT_NOT_FOUND") {
      //   message.error("账户未找到");
      // } else if (e.data?.code === "UNPROCESSABLE_CONTENT") {
      //   message.error("该用户已经在账户内，无法重复添加");
      // } else {
      //   message.error(e.message);
      // }
    },
  });

  const onOk = async () => {
    form.validateFields();
    const { name, type, description, scene } = await form.validateFields();
    mutation.mutate({
      name,
      type,
      description,
      scene,
      owner,
    });
  };


  return (
    <Modal
      title="添加数据集"
      open={open}
      onOk={form.submit}
      confirmLoading={mutation.isLoading}
      onCancel={onClose}
    >
      <Form
        form={form}
        onFinish={onOk}
        wrapperCol={{ span: 20 }}
        labelCol={{ span: 4 }}
      >
        <Form.Item
          label="名称"
          name="name"
          rules={[
            { required: true },
          ]}
        >
          <Input allowClear />
        </Form.Item>
        <Form.Item label="数据类型" name="type">
          <Select
            style={{ minWidth: "100px" }}
          >
            {Object.entries(DatasetTypeText).map(([key, value]) => (
              <Select.Option key={key} value={key}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="应用场景" name="scene">
          <Select
            style={{ minWidth: "100px" }}
          >
            {Object.entries(SceneTypeText).map(([key, value]) => (
              <Select.Option key={key} value={key}>
                {value}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item label="数据集描述" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};
